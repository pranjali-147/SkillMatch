from flask import Blueprint, jsonify, request, session
from pymongo.errors import PyMongoError

from db import get_job_descriptions_collection

jd_bp = Blueprint("jd", __name__)


def _next_id(collection):
    """Get next integer id for a new job description."""
    doc = collection.find_one(sort=[("id", -1)])
    return (doc["id"] + 1) if doc else 1


# -------------------------------
# GET JDS (filtered by HR email for HR users)
# -------------------------------
@jd_bp.route("/jds", methods=["GET"])
def get_job_descriptions():
    try:
        coll = get_job_descriptions_collection()
        hr_email = session.get("user")
        role = session.get("role")

        if role == "hr" and hr_email:
            cursor = coll.find({"hr_email": hr_email}, {"_id": 0})
        else:
            # Students and unauthenticated: return all JDs from MongoDB
            cursor = coll.find({}, {"_id": 0})

        jds = list(cursor)
        return jsonify(jds)
    except PyMongoError:
        return jsonify([]), 200


# -------------------------------
# ADD NEW JD
# -------------------------------
@jd_bp.route("/jds", methods=["POST"])
def add_job_description():
    hr_email = session.get("user")
    role = session.get("role")
    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can add job descriptions"}), 403

    data = request.json
    if not data:
        return jsonify({"message": "Invalid data"}), 400

    required_skills = data.get("required_skills", [])
    if isinstance(required_skills, str):
        required_skills = [s.strip() for s in required_skills.split(",") if s.strip()]

    try:
        coll = get_job_descriptions_collection()
        new_id = _next_id(coll)

        new_jd = {
            "id": new_id,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "required_skills": required_skills,
            "hr_email": hr_email,
        }

        coll.insert_one(new_jd)
        return jsonify({"message": "JD added successfully"}), 201
    except (ConnectionError, PyMongoError):
        return jsonify({"message": "Database error. Could not save job description. Check MongoDB connection."}), 503


# -------------------------------
# EDIT JD
# -------------------------------
@jd_bp.route("/jds/<int:jd_id>", methods=["PUT"])
def update_job_description(jd_id):
    hr_email = session.get("user")
    role = session.get("role")
    if role != "hr" or not hr_email:
        return jsonify({"message": "Only HR can edit job descriptions"}), 403

    data = request.json
    if not data:
        return jsonify({"message": "Invalid data"}), 400

    coll = get_job_descriptions_collection()
    result = coll.update_one(
        {"id": jd_id, "hr_email": hr_email},
        {
            "$set": {
                "title": data.get("title", ""),
                "description": data.get("description", ""),
                "required_skills": data.get("required_skills", []),
            }
        },
    )

    if result.modified_count == 0:
        if coll.find_one({"id": jd_id}) is None:
            return jsonify({"message": "JD not found"}), 404
        return jsonify({"message": "You can only edit your own job descriptions"}), 403

    return jsonify({"message": "JD updated successfully"}), 200


# -------------------------------
# DELETE JD
# -------------------------------
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
