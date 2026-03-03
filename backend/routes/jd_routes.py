from flask import Blueprint, jsonify, request
import json

jd_bp = Blueprint("jd", __name__)

# -------------------------------
# GET ALL JDS
# -------------------------------
@jd_bp.route("/jds", methods=["GET"])
def get_job_descriptions():
    with open("data/job_descriptions.json") as f:
        data = json.load(f)
    return jsonify(data)


# -------------------------------
# ADD NEW JD
# -------------------------------
@jd_bp.route("/jds", methods=["POST"])
def add_job_description():
    data = request.json

    with open("data/job_descriptions.json", "r") as f:
        jd_data = json.load(f)

    new_id = max([jd["id"] for jd in jd_data]) + 1 if jd_data else 1

    new_jd = {
        "id": new_id,
        "title": data["title"],
        "description": data["description"],
        "required_skills": data["required_skills"]
    }

    jd_data.append(new_jd)

    with open("data/job_descriptions.json", "w") as f:
        json.dump(jd_data, f, indent=4)

    return jsonify({"message": "JD added successfully"}), 201


# -------------------------------
# EDIT JD
# -------------------------------
@jd_bp.route("/jds/<int:jd_id>", methods=["PUT"])
def update_job_description(jd_id):
    data = request.json

    with open("data/job_descriptions.json", "r") as f:
        jd_data = json.load(f)

    for jd in jd_data:
        if jd["id"] == jd_id:
            jd["title"] = data["title"]
            jd["description"] = data["description"]
            jd["required_skills"] = data["required_skills"]
            break

    with open("data/job_descriptions.json", "w") as f:
        json.dump(jd_data, f, indent=4)

    return jsonify({"message": "JD updated successfully"}), 200


@jd_bp.route("/jds/<int:jd_id>", methods=["DELETE"])
def delete_job_description(jd_id):
    with open("data/job_descriptions.json", "r") as f:
        jd_data = json.load(f)

    jd_data = [jd for jd in jd_data if jd["id"] != jd_id]

    with open("data/job_descriptions.json", "w") as f:
        json.dump(jd_data, f, indent=4)

    return jsonify({"message": "JD deleted successfully"}), 200