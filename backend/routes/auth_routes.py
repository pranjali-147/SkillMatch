from flask import Blueprint, request, jsonify, session

auth_bp = Blueprint("auth", __name__)

# Hardcoded user (for testing)
USERS = {
     "hr@test.com": {
        "password": "1234",
        "role": "hr"
    },
    "student@test.com": {
        "password": "1234",
        "role": "student"
    }
}

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = USERS.get(email)

    if user and user["password"] == password:
        session["user"] = email
        session["role"] = user["role"]
        return jsonify({
            "message": "Login successful",
            "role": user["role"]
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/check-session", methods=["GET"])
def check_session():
    if "user" in session:
        return jsonify({
            "logged_in": True,
            "user": session["user"],
            "role": session.get("role")
        })
    return jsonify({"logged_in": False})
