from datetime import datetime, timezone
import random
from flask import Blueprint, request, jsonify, g
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

from config import Config
from database import get_users_collection, serialize_doc
from middleware.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def generate_meter_number():
    """Generates a unique meter number formatted like ELEC-12345."""
    return f"ELEC-{random.randint(10000, 99999)}"

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user (Consumer or Admin).
    """
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "consumer").lower()
    address = data.get("address", "").strip()
    meter_number = data.get("meter_number", "").strip().upper()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required fields."}), 400

    if role not in ["admin", "consumer"]:
        return jsonify({"error": "Role must be 'admin' or 'consumer'."}), 400

    users_coll = get_users_collection()

    # Check email uniqueness
    if users_coll.find_one({"email": email}):
        return jsonify({"error": "An account with this email address already exists."}), 409

    # For consumers, ensure meter number is provided or generated
    if role == "consumer":
        if not meter_number:
            # Auto generate unique meter number
            while True:
                candidate = generate_meter_number()
                if not users_coll.find_one({"meter_number": candidate}):
                    meter_number = candidate
                    break
        else:
            if users_coll.find_one({"meter_number": meter_number}):
                return jsonify({"error": f"Meter number '{meter_number}' is already registered."}), 409
    else:
        meter_number = None

    password_hash = generate_password_hash(password)
    new_user = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "meter_number": meter_number,
        "address": address or "123 Main Street",
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    }

    result = users_coll.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    # Create JWT token
    token_payload = {
        "sub": str(result.inserted_id),
        "email": email,
        "role": role,
        "meter_number": meter_number,
        "exp": datetime.now(timezone.utc) + Config.JWT_ACCESS_TOKEN_EXPIRES,
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(token_payload, Config.JWT_SECRET_KEY, algorithm="HS256")

    user_data = serialize_doc(new_user)
    user_data.pop("password_hash", None)

    return jsonify({
        "message": "Registration successful.",
        "token": token,
        "user": user_data
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login endpoint. Supports email or meter number as identifier.
    """
    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()
    # Support direct "email" or "meter_number" fields as fallback
    if not identifier:
        identifier = data.get("email", "").strip() or data.get("meter_number", "").strip()
    
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Identifier (Email or Meter Number) and password are required."}), 400

    users_coll = get_users_collection()
    
    # Query by email (case-insensitive) or meter_number
    query = {
        "$or": [
            {"email": identifier.lower()},
            {"meter_number": identifier.upper()}
        ]
    }
    user = users_coll.find_one(query)

    if not user:
        return jsonify({"error": "Invalid email/meter number or password."}), 401

    if not check_password_hash(user.get("password_hash", ""), password):
        return jsonify({"error": "Invalid email/meter number or password."}), 401

    if user.get("status") == "inactive":
        return jsonify({"error": "This account is inactive. Please contact the utility office."}), 403

    token_payload = {
        "sub": str(user["_id"]),
        "email": user.get("email"),
        "role": user.get("role"),
        "meter_number": user.get("meter_number"),
        "exp": datetime.now(timezone.utc) + Config.JWT_ACCESS_TOKEN_EXPIRES,
        "iat": datetime.now(timezone.utc)
    }
    token = jwt.encode(token_payload, Config.JWT_SECRET_KEY, algorithm="HS256")

    user_data = serialize_doc(user)
    user_data.pop("password_hash", None)

    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user_data
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user_profile():
    """
    Returns the authenticated user's profile.
    """
    user_data = g.current_user.copy()
    user_data.pop("password_hash", None)
    return jsonify({"user": user_data}), 200

@auth_bp.route("/me", methods=["PUT"])
@token_required
def update_profile():
    """
    Update profile details for the authenticated user.
    """
    data = request.get_json() or {}
    users_coll = get_users_collection()
    user_id = ObjectId(g.current_user["id"])

    updates = {}
    if "name" in data and data["name"].strip():
        updates["name"] = data["name"].strip()
    if "address" in data:
        updates["address"] = data["address"].strip()
    if "phone" in data:
        updates["phone"] = data["phone"].strip()

    if updates:
        users_coll.update_one({"_id": user_id}, {"$set": updates})

    updated_user = users_coll.find_one({"_id": user_id})
    user_data = serialize_doc(updated_user)
    user_data.pop("password_hash", None)

    return jsonify({"message": "Profile updated successfully.", "user": user_data}), 200
