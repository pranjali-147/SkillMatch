from flask import Blueprint, request, jsonify, session
import os
from datetime import datetime

from db import get_job_descriptions_collection, get_uploaded_resumes_collection
from utils.text_extractor import extract_text
from utils.embedding_model import calculate_similarity
from utils.course_recommender import get_course_recommendations

analyze_routes = Blueprint("analyze_routes", __name__)

UPLOAD_FOLDER = "uploads/hr_resumes"


def get_jd_data(jd_id):
    coll = get_job_descriptions_collection()
    jd = coll.find_one({"id": jd_id})
    if jd:
        jd.pop("_id", None)
    return jd

@analyze_routes.route("/send-to-hr/<int:jd_id>", methods=["POST"])
def send_to_hr(jd_id):
    student_email = session.get("user")
    if not student_email:
        return jsonify({"error": "You must be logged in to send resumes"}), 401

    jd_data = get_jd_data(jd_id)
    if not jd_data:
        return jsonify({"error": "Invalid job description"}), 404
    hr_email = jd_data.get("hr_email")
    if not hr_email:
        return jsonify({"error": "Could not determine HR for this job"}), 400

    if "resumes" not in request.files:
        return jsonify({"error": "No resumes uploaded"}), 400

    files = request.files.getlist("resumes")
    saved_files = []
    resumes_coll = get_uploaded_resumes_collection()

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    for file in files:
        if not file.filename:
            continue
        filename = f"{jd_id}_{student_email}_{file.filename}"
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)

        doc = {
            "student_email": student_email,
            "hr_email": hr_email,
            "jd_id": jd_id,
            "filename": filename,
            "uploaded_at": datetime.utcnow(),
        }
        resumes_coll.insert_one(doc)

        saved_files.append({"filename": filename, "uploaded_by": student_email})

    return jsonify({
        "message": "Resumes sent to HR successfully",
        "files": saved_files
    })

@analyze_routes.route("/hr-resumes/<int:jd_id>", methods=["GET"])
def get_hr_resumes(jd_id):
    hr_email = session.get("user")
    role = session.get("role")
    if role != "hr" or not hr_email:
        return jsonify({"error": "Only HR can view resumes"}), 403

    coll = get_uploaded_resumes_collection()
    cursor = coll.find(
        {"jd_id": jd_id, "hr_email": hr_email},
        {"_id": 0, "filename": 1, "student_email": 1}
    )
    resumes = [
        {"filename": doc["filename"], "uploaded_by": doc.get("student_email", "Unknown")}
        for doc in cursor
    ]
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

        # Fetch course recommendations for the student's missing skills
        course_recommendations = get_course_recommendations(
            analysis["missing_skills"]
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
            "course_recommendations": course_recommendations,
            "status": status
        })

    return jsonify({
        "jd_id": jd_id,
        "results": results
    })