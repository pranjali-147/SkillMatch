from flask import Blueprint, request, jsonify, session
import os
import json

from utils.text_extractor import extract_text
from utils.embedding_model import calculate_similarity

analyze_routes = Blueprint("analyze_routes", __name__)

UPLOAD_FOLDER = "uploads/hr_resumes"


def get_jd_data(jd_id):
    with open("data/job_descriptions.json", "r") as f:
        jd_data = json.load(f)

    for jd in jd_data:
        if jd["id"] == jd_id:
            return jd

    return None

@analyze_routes.route("/send-to-hr/<int:jd_id>", methods=["POST"])
def send_to_hr(jd_id):

    student_email = session.get("user")

    if "resumes" not in request.files:
        return jsonify({"error": "No resumes uploaded"}), 400

    files = request.files.getlist("resumes")

    saved_files = []

    for file in files:

        # Include jd_id in filename so HR can filter by job description
        filename = f"{jd_id}_{student_email}_{file.filename}"

        save_path = os.path.join("uploads/hr_resumes", filename)

        os.makedirs("uploads/hr_resumes", exist_ok=True)

        file.save(save_path)

        saved_files.append({
            "filename": filename,
            "uploaded_by": student_email
        })

    return jsonify({
        "message": "Resumes sent to HR successfully",
        "files": saved_files
    })

@analyze_routes.route("/hr-resumes/<int:jd_id>", methods=["GET"])
def get_hr_resumes(jd_id):

    folder = "uploads/hr_resumes"

    if not os.path.exists(folder):
        return jsonify([])

    files = os.listdir(folder)

    resumes = []

    for file in files:

        if not file.startswith(f"{jd_id}_"):
            continue

        parts = file.split("_", 2)

        if len(parts) == 3:
            uploaded_by = parts[1]
            filename = parts[2]
        else:
            uploaded_by = "Unknown"
            filename = file

        resumes.append({
            "filename": filename,
            "uploaded_by": uploaded_by
        })

    return jsonify(resumes)

@analyze_routes.route("/analyze/<int:jd_id>", methods=["POST"])
def upload_resumes(jd_id):

    student_email = session.get("user")

    if "resumes" not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    jd_data = get_jd_data(jd_id)

    if not jd_data:
        return jsonify({"error": "Invalid JD ID"}), 404

    jd_text = jd_data["description"]
    required_skills = jd_data["required_skills"]

    files = request.files.getlist("resumes")

    results = []

    for file in files:

        filename = f"{student_email}_{file.filename}"
        save_path = os.path.join(UPLOAD_FOLDER, filename)

        file.save(save_path)

        resume_text = extract_text(save_path)

        analysis = calculate_similarity(
            jd_text,
            resume_text,
            required_skills
        )

        if analysis["final_score"] >= 75:
            status = "Highly Suitable"
        elif analysis["final_score"] >= 50:
            status = "Moderately Suitable"
        else:
            status = "Needs Improvement"

        results.append({
            "filename": filename,
            "uploaded_by": student_email,
            "final_score": analysis["final_score"],
            "semantic_score": analysis["semantic_score"],
            "skill_score": analysis["skill_score"],
            "matched_skills": analysis["matched_skills"],
            "missing_skills": analysis["missing_skills"],
            "status": status
        })

    return jsonify({
        "jd_id": jd_id,
        "results": results
    })
