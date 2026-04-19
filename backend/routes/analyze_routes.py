from flask import Blueprint, request, jsonify, session, send_file
from datetime import datetime
import io

from bson import ObjectId
from pymongo.errors import PyMongoError

from db import (
    get_job_descriptions_collection,
    get_uploaded_resumes_collection,
    get_resumes_bucket,
    get_selected_candidates_collection,
)
from utils.text_extractor import extract_text_from_bytes
from utils.embedding_model import calculate_similarity
from utils.course_recommender import get_course_recommendations

analyze_routes = Blueprint("analyze_routes", __name__)


@analyze_routes.route("/view-resume/<file_id>")
def view_resume(file_id):
    bucket = get_resumes_bucket()

    try:
        grid_file = bucket.open_download_stream(ObjectId(file_id))
        file_bytes = grid_file.read()
    except Exception:
        return {"message": "File not found"}, 404

    return send_file(
        io.BytesIO(file_bytes),
        download_name=grid_file.filename,
        mimetype=grid_file.metadata.get("content_type", "application/octet-stream"),
    )


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
        except (ConnectionError, PyMongoError):
            return jsonify({"error": "Database error. Could not upload resumes."}), 503

        doc = {
            "student_email": student_email,
            "hr_email": hr_email,
            "jd_id": jd_id,
            "gridfs_file_id": gridfs_file_id,
            "original_filename": file.filename,
            "uploaded_at": uploaded_at,
            "notified": False,
            "selected": False,
        }
        resumes_coll.insert_one(doc)

        saved_files.append(
            {
                "filename": file.filename,
                "uploaded_by": student_email,
                "email": student_email,
                "file_id": str(gridfs_file_id),
            }
        )

    return jsonify(
        {
            "message": "Resumes sent to HR successfully",
            "files": saved_files,
        }
    )


@analyze_routes.route("/hr-resumes/<int:jd_id>", methods=["GET"])
def get_hr_resumes(jd_id):
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"error": "Only HR can view resumes"}), 403

    coll = get_uploaded_resumes_collection()
    cursor = coll.find(
        {"jd_id": jd_id, "hr_email": hr_email},
        {"student_email": 1, "original_filename": 1, "gridfs_file_id": 1},
    )

    resumes = []
    for doc in cursor:
        student_email = doc.get("student_email", "")
        resumes.append(
            {
                "filename": doc.get("original_filename", "resume"),
                "uploaded_by": student_email or "Unknown",
                "email": student_email,
                "candidate_email": student_email,
                "file_id": str(doc.get("gridfs_file_id", "")),
            }
        )

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

        try:
            stored_file_id = bucket.upload_from_stream(
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
        analysis = calculate_similarity(jd_text, resume_text, required_skills)
        course_recommendations = get_course_recommendations(
            analysis["missing_skills"]
        )

        if analysis["final_score"] >= 75:
            status = "Highly Suitable"
        elif analysis["final_score"] >= 50:
            status = "Moderately Suitable"
        else:
            status = "Needs Improvement"

        results.append(
            {
                "file_id": str(stored_file_id),
                "filename": file.filename,
                "uploaded_by": student_email,
                "email": student_email,
                "candidate_email": student_email,
                "final_score": analysis["final_score"],
                "semantic_score": analysis["semantic_score"],
                "skill_score": analysis["skill_score"],
                "matched_skills": analysis["matched_skills"],
                "missing_skills": analysis["missing_skills"],
                "course_recommendations": course_recommendations,
                "status": status,
            }
        )

    return jsonify({"jd_id": jd_id, "results": results})


@analyze_routes.route("/evaluate-selected/<int:jd_id>", methods=["POST"])
def evaluate_selected(jd_id):
    data = request.get_json()
    selected_resumes = data.get("resumes", []) if data else []

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
        except Exception:
            continue

        filename = grid_file.filename
        student_email = grid_file.metadata.get("student_email", "Unknown")

        resume_text = extract_text_from_bytes(filename, file_bytes)
        analysis = calculate_similarity(jd_text, resume_text, required_skills)

        if analysis["final_score"] >= 75:
            status = "Highly Suitable"
        elif analysis["final_score"] >= 50:
            status = "Moderately Suitable"
        else:
            status = "Needs Improvement"

        results.append(
            {
                "file_id": str(file_id),
                "filename": filename,
                "uploaded_by": student_email,
                "email": student_email,
                "candidate_email": student_email,
                "final_score": analysis["final_score"],
                "semantic_score": analysis["semantic_score"],
                "skill_score": analysis["skill_score"],
                "matched_skills": analysis["matched_skills"],
                "missing_skills": analysis["missing_skills"],
                "status": status,
            }
        )

    return jsonify({"jd_id": jd_id, "results": results})


@analyze_routes.route("/notify-selected/<int:jd_id>", methods=["POST"])
def notify_selected(jd_id):
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can notify candidates"}), 403

    jd_data = get_jd_data(jd_id)
    if not jd_data:
        return jsonify({"message": "Invalid job description"}), 404

    if jd_data.get("hr_email") != hr_email:
        return jsonify({"message": "You can only notify candidates for your own JD"}), 403

    payload = request.get_json(silent=True) or {}
    candidates = payload.get("candidates", [])
    selected_resumes = payload.get("resumes", [])

    resumes_coll = get_uploaded_resumes_collection()
    selected_coll = get_selected_candidates_collection()
    bucket = get_resumes_bucket()

    updated_count = 0
    selected_at = datetime.utcnow()
    notification_message = (
        f"You have been shortlisted for {jd_data.get('title', 'this role')}."
    )

    candidate_map = {}
    for candidate in candidates:
        file_id = candidate.get("file_id")
        if file_id:
            candidate_map[file_id] = candidate

    processed_file_ids = set()

    for file_id, candidate in candidate_map.items():
        try:
            resume_doc = resumes_coll.find_one(
                {"gridfs_file_id": ObjectId(file_id), "jd_id": jd_id}
            )

            student_email = (
                candidate.get("email")
                or candidate.get("candidate_email")
                or candidate.get("uploaded_by")
            )

            filename = candidate.get("filename", "Resume")
            final_score = candidate.get("final_score")

            if resume_doc:
                student_email = student_email or resume_doc.get("student_email", "")
                filename = resume_doc.get("original_filename", filename)

            selected_coll.update_one(
                {
                    "jd_id": jd_id,
                    "file_id": file_id,
                },
                {
                    "$set": {
                        "jd_id": jd_id,
                        "file_id": file_id,
                        "hr_email": hr_email,
                        "student_email": student_email,
                        "filename": filename,
                        "final_score": final_score,
                        "jd_title": jd_data.get("title", ""),
                        "company_name": jd_data.get("company_name", ""),
                        "selected": True,
                        "selected_at": selected_at,
                        "notified": True,
                        "notification_title": "Selection Update",
                        "notification_message": notification_message,
                    }
                },
                upsert=True,
            )

            resumes_coll.update_one(
                {"gridfs_file_id": ObjectId(file_id), "jd_id": jd_id},
                {
                    "$set": {
                        "selected": True,
                        "selected_at": selected_at,
                        "notified": True,
                        "notified_at": selected_at,
                        "notification_title": "Selection Update",
                        "notification_message": notification_message,
                        "jd_title": jd_data.get("title", ""),
                        "company_name": jd_data.get("company_name", ""),
                    }
                },
            )

            processed_file_ids.add(file_id)
            updated_count += 1
        except Exception as exc:
            print("SELECTED CANDIDATE STORE ERROR:", str(exc))

    for file_id in selected_resumes:
        if file_id in processed_file_ids:
            continue

        try:
            grid_file = bucket.open_download_stream(ObjectId(file_id))
            student_email = grid_file.metadata.get("student_email", "")
            filename = grid_file.filename

            selected_coll.update_one(
                {
                    "jd_id": jd_id,
                    "file_id": file_id,
                },
                {
                    "$set": {
                        "jd_id": jd_id,
                        "file_id": file_id,
                        "hr_email": hr_email,
                        "student_email": student_email,
                        "filename": filename,
                        "final_score": None,
                        "jd_title": jd_data.get("title", ""),
                        "company_name": jd_data.get("company_name", ""),
                        "selected": True,
                        "selected_at": selected_at,
                        "notified": True,
                        "notification_title": "Selection Update",
                        "notification_message": notification_message,
                    }
                },
                upsert=True,
            )

            resumes_coll.update_one(
                {"gridfs_file_id": ObjectId(file_id), "jd_id": jd_id},
                {
                    "$set": {
                        "student_email": student_email,
                        "selected": True,
                        "selected_at": selected_at,
                        "notified": True,
                        "notified_at": selected_at,
                        "notification_title": "Selection Update",
                        "notification_message": notification_message,
                        "jd_title": jd_data.get("title", ""),
                        "company_name": jd_data.get("company_name", ""),
                    }
                },
            )

            updated_count += 1
        except Exception as exc:
            print("SELECTED CANDIDATE STORE ERROR:", str(exc))

    if updated_count == 0:
        return jsonify({"message": "No selected candidates found to notify"}), 400

    return jsonify(
        {
            "message": f"{updated_count} selected candidate(s) stored and notified successfully.",
        }
    ), 200


@analyze_routes.route("/selected-candidates", methods=["GET"])
def get_selected_candidates():
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can view selected candidates"}), 403

    coll = get_selected_candidates_collection()
    docs = list(
        coll.find(
            {"hr_email": hr_email, "selected": True},
            {"_id": 0},
        ).sort("selected_at", -1)
    )

    return jsonify(docs), 200


@analyze_routes.route("/student-notifications", methods=["GET"])
def student_notifications():
    student_email = session.get("user")
    role = session.get("role")

    if role != "student" or not student_email:
        return jsonify({"message": "Only students can view notifications"}), 403

    coll = get_uploaded_resumes_collection()
    cursor = coll.find(
        {"student_email": student_email, "notified": True},
        {
            "_id": 0,
            "jd_id": 1,
            "notification_title": 1,
            "notification_message": 1,
            "jd_title": 1,
            "company_name": 1,
            "notified_at": 1,
            "original_filename": 1,
        },
    ).sort("notified_at", -1)

    notifications = []
    for doc in cursor:
        notifications.append(
            {
                "id": f"{doc.get('jd_id', '')}-{doc.get('original_filename', '')}-{str(doc.get('notified_at', ''))}",
                "title": doc.get("notification_title", "Selection Update"),
                "message": doc.get(
                    "notification_message",
                    "HR has shortlisted you for the next step.",
                ),
                "jd_title": doc.get("jd_title", ""),
                "company_name": doc.get("company_name", ""),
                "notified_at": doc.get("notified_at"),
            }
        )

    return jsonify({"notifications": notifications})

@analyze_routes.route("/manual-student-match", methods=["POST"])
def manual_student_match():
    student_email = session.get("user")
    if not student_email:
        return jsonify({"message": "You must be logged in"}), 401

    description = request.form.get("description", "").strip()
    resume = request.files.get("resume")

    if not description:
        return jsonify({"message": "Job description is required"}), 400

    if not resume or not resume.filename:
        return jsonify({"message": "Resume file is required"}), 400

    required_skills = []
    jd_text = description

    marker = "Skills (comma separated):"
    if marker.lower() in description.lower():
        index = description.lower().rfind(marker.lower())
        jd_text = description[:index].strip()
        skills_text = description[index + len(marker):].strip()
        required_skills = [skill.strip() for skill in skills_text.split(",") if skill.strip()]

    file_bytes = resume.read()
    resume_text = extract_text_from_bytes(resume.filename, file_bytes)

    analysis = calculate_similarity(jd_text, resume_text, required_skills)
    course_recommendations = get_course_recommendations(
        analysis.get("missing_skills", [])
    )

    if analysis["final_score"] >= 75:
        status = "Highly Suitable"
    elif analysis["final_score"] >= 50:
        status = "Moderately Suitable"
    else:
        status = "Needs Improvement"

    return jsonify(
        {
            "result": {
                "filename": resume.filename,
                "uploaded_by": student_email,
                "email": student_email,
                "candidate_email": student_email,
                "final_score": analysis["final_score"],
                "semantic_score": analysis["semantic_score"],
                "skill_score": analysis["skill_score"],
                "matched_skills": analysis["matched_skills"],
                "missing_skills": analysis["missing_skills"],
                "course_recommendations": course_recommendations,
                "status": status,
            }
        }
    )
