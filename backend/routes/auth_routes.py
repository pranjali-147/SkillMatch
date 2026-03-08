from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import PyMongoError

from db import get_users_collection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password", "")
        role = (data.get("role") or "student").strip().lower()
        if role not in ("student", "hr"):
            role = "student"

        if not username or not email or not password:
            return jsonify({"message": "Username, email and password are required"}), 400

        users = get_users_collection()
        existing = users.find_one({"$or": [{"email": email}, {"username": username}]})
        if existing:
            if existing.get("email") == email:
                return jsonify({"message": "An account with this email already exists"}), 409
            return jsonify({"message": "Username is already taken"}), 409

        password_hash = generate_password_hash(password, method="pbkdf2:sha256")
        user_doc = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "role": role,
        }
        users.insert_one(user_doc)
        return jsonify({
            "message": "Account created successfully. You can now log in.",
            "email": email,
        }), 201
    except (ConnectionError, PyMongoError) as e:
        return jsonify({
            "message": "Database error. Check MongoDB connection and MONGODB_URI in .env"
        }), 503


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    users = get_users_collection()
    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401
    if not check_password_hash(user["password_hash"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    session["user"] = email
    session["username"] = user.get("username", "")
    session["role"] = user.get("role", "student")
    return jsonify({
        "message": "Login successful",
        "role": user.get("role", "student"),
        "username": user.get("username", ""),
    }), 200


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
            "username": session.get("username", ""),
            "role": session.get("role"),
        })
    return jsonify({"logged_in": False})
