from flask import Blueprint, request, jsonify, session
from datetime import datetime
import io
from bson import ObjectId

from pymongo.errors import PyMongoError

from db import (
    get_job_descriptions_collection,
    get_uploaded_resumes_collection,
    get_resumes_bucket,
)
from utils.text_extractor import extract_text_from_bytes
from utils.embedding_model import calculate_similarity
from utils.course_recommender import get_course_recommendations

analyze_routes = Blueprint("analyze_routes", __name__)


def get_jd_data(jd_id):
    coll = get_job_descriptions_collection()
    jd = coll.find_one({"id": jd_id})
    if jd:
        jd.pop("_id", None)
    return jd

@analyze_routes.route("/send-to-hr/<int:jd_id>", methods=["POST"])
def send_to_hr(jd_id):
    print("SEND TO HR ROUTE CALLED")
    print(request.files)
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
    bucket = get_resumes_bucket()

    for file in files:
        if not file.filename:
            continue
        uploaded_at = datetime.utcnow()

        try:
            gridfs_file_id = bucket.upload_from_stream(
                file.filename,
                file.stream,
                
                metadata={
                    "student_email": student_email,
                    "hr_email": hr_email,
                    "jd_id": jd_id,
                    "uploaded_at": uploaded_at,
                    "content_type": file.mimetype,
                },
                
            )
            print("GRIDFS FILE ID:", gridfs_file_id)
        except (ConnectionError, PyMongoError):
            return jsonify({"error": "Database error. Could not upload resumes."}), 503

        doc = {
            "student_email": student_email,
            "hr_email": hr_email,
            "jd_id": jd_id,
            "gridfs_file_id": gridfs_file_id,
            "original_filename": file.filename,
            "uploaded_at": uploaded_at,
        }
        resumes_coll.insert_one(doc)

        saved_files.append({"filename": file.filename, "uploaded_by": student_email})

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
        {"student_email": 1, "original_filename": 1, "gridfs_file_id": 1}
    )
    resumes = []
    for doc in cursor:
        resumes.append({
            "filename": doc.get("original_filename", "resume"),
            "uploaded_by": doc.get("student_email", "Unknown"),
            "file_id": str(doc.get("gridfs_file_id", "")),
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
    bucket = get_resumes_bucket()

    for file in files:
        if not file.filename:
            continue

        data = file.read()

        # Store in MongoDB (GridFS) - no local uploads folder
        try:
            bucket.upload_from_stream(
                file.filename,
                io.BytesIO(data),
                metadata={
                    "student_email": student_email,
                    "jd_id": jd_id,
                    "purpose": "self_evaluation",
                    "uploaded_at": datetime.utcnow(),
                    "content_type": file.mimetype,
                },
            )
        except (ConnectionError, PyMongoError):
            return jsonify({"error": "Database error. Could not upload files."}), 503

        resume_text = extract_text_from_bytes(file.filename, data)

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
            "filename": file.filename,
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


@analyze_routes.route("/evaluate-selected/<int:jd_id>", methods=["POST"])
def evaluate_selected(jd_id):

    print("EVALUATE SELECTED ROUTE HIT")

    data = request.get_json()
    selected_resumes = data.get("resumes", [])

    if not selected_resumes:
        return jsonify({"error": "No resumes selected"}), 400

    jd_data = get_jd_data(jd_id)
    if not jd_data:
        return jsonify({"error": "Invalid job description"}), 404

    jd_text = jd_data["description"]
    required_skills = jd_data["required_skills"]

    bucket = get_resumes_bucket()
    results = []

    for file_id in selected_resumes:

        try:
            grid_file = bucket.open_download_stream(ObjectId(file_id))
            file_bytes = grid_file.read()

        except Exception as e:
            print("GRIDFS DOWNLOAD ERROR:", e)
            continue

        filename = grid_file.filename
        student_email = grid_file.metadata.get("student_email", "Unknown")

        resume_text = extract_text_from_bytes(filename, file_bytes)

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