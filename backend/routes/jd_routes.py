from flask import Blueprint, jsonify, request, session
from pymongo.errors import PyMongoError

from db import get_job_descriptions_collection

jd_bp = Blueprint("jd", __name__)


def _next_id(collection):
    doc = collection.find_one(sort=[("id", -1)])
    return (doc["id"] + 1) if doc else 1


def _normalize_required_skills(required_skills):
    if isinstance(required_skills, str):
        return [s.strip() for s in required_skills.split(",") if s.strip()]
    if isinstance(required_skills, list):
        return [str(s).strip() for s in required_skills if str(s).strip()]
    return []


@jd_bp.route("/jds", methods=["GET"])
def get_job_descriptions():
    try:
        coll = get_job_descriptions_collection()
        hr_email = session.get("user")
        role = session.get("role")

        if role == "hr" and hr_email:
            cursor = coll.find({"hr_email": hr_email}, {"_id": 0})
        else:
            cursor = coll.find({}, {"_id": 0})

        jds = list(cursor)
        return jsonify(jds)
    except PyMongoError:
        return jsonify([]), 200


@jd_bp.route("/jds", methods=["POST"])
def add_job_description():
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can add job descriptions"}), 403

    data = request.json
    if not data:
        return jsonify({"message": "Invalid data"}), 400

    required_skills = _normalize_required_skills(data.get("required_skills", []))

    try:
        coll = get_job_descriptions_collection()
        new_id = _next_id(coll)

        new_jd = {
            "id": new_id,
            "company_name": data.get("company_name", "").strip(),
            "title": data.get("title", "").strip(),
            "description": data.get("description", "").strip(),
            "location": data.get("location", "").strip(),
            "stipend_salary": data.get("stipend_salary", "").strip(),
            "employment_type": data.get("employment_type", "").strip(),
            "experience_level": data.get("experience_level", "").strip(),
            "required_skills": required_skills,
            "hr_email": hr_email,
        }

        coll.insert_one(new_jd)
        return jsonify({"message": "JD added successfully"}), 201
    except (ConnectionError, PyMongoError):
        return jsonify(
            {
                "message": "Database error. Could not save job description. Check MongoDB connection."
            }
        ), 503


@jd_bp.route("/jds/<int:jd_id>", methods=["PUT"])
def update_job_description(jd_id):
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can edit job descriptions"}), 403

    data = request.json
    if not data:
        return jsonify({"message": "Invalid data"}), 400

    required_skills = _normalize_required_skills(data.get("required_skills", []))

    coll = get_job_descriptions_collection()
    result = coll.update_one(
        {"id": jd_id, "hr_email": hr_email},
        {
            "$set": {
                "company_name": data.get("company_name", "").strip(),
                "title": data.get("title", "").strip(),
                "description": data.get("description", "").strip(),
                "location": data.get("location", "").strip(),
                "stipend_salary": data.get("stipend_salary", "").strip(),
                "employment_type": data.get("employment_type", "").strip(),
                "experience_level": data.get("experience_level", "").strip(),
                "required_skills": required_skills,
            }
        },
    )

    if result.matched_count == 0:
        if coll.find_one({"id": jd_id}) is None:
            return jsonify({"message": "JD not found"}), 404
        return jsonify({"message": "You can only edit your own job descriptions"}), 403

    return jsonify({"message": "JD updated successfully"}), 200


@jd_bp.route("/jds/<int:jd_id>", methods=["DELETE"])
def delete_job_description(jd_id):
    hr_email = session.get("user")
    role = session.get("role")

    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can delete job descriptions"}), 403

    coll = get_job_descriptions_collection()
    result = coll.delete_one({"id": jd_id, "hr_email": hr_email})

    if result.deleted_count == 0:
        if coll.find_one({"id": jd_id}) is None:
            return jsonify({"message": "JD not found"}), 404
        return jsonify({"message": "You can only delete your own job descriptions"}), 403

    return jsonify({"message": "JD deleted successfully"}), 200
