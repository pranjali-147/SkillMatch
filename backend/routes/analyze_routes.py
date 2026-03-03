from flask import Blueprint, request, jsonify
import os
import json

from utils.text_extractor import extract_text
from utils.embedding_model import calculate_similarity

# ✅ Blueprint must be defined first
analyze_routes = Blueprint("analyze_routes", __name__)

# ✅ Upload folder defined before route
UPLOAD_FOLDER = "uploads/resumes"

def get_jd_data(jd_id):
    with open("data/job_descriptions.json", "r") as f:
        jd_data = json.load(f)

    for jd in jd_data:
        if jd["id"] == jd_id:
            return jd

    return None


@analyze_routes.route("/analyze/<int:jd_id>", methods=["POST"])
def upload_resumes(jd_id):

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
        filename = file.filename
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)

        # Extract resume text
        resume_text = extract_text(save_path)

        # Calculate semantic similarity
        analysis = calculate_similarity(jd_text, resume_text,required_skills)


        # Status logic
        if analysis["final_score"] >= 75:
            status = "Highly Suitable"
        elif analysis["final_score"] >= 50:
            status = "Moderately Suitable"
        else:
            status = "Needs Improvement"


        results.append({
    "filename": filename,
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
