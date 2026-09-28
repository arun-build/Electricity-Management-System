from datetime import datetime, timezone
import random
from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from werkzeug.security import generate_password_hash

from database import get_users_collection, get_bills_collection, serialize_doc, serialize_docs
from middleware.auth_middleware import token_required, admin_required

consumer_bp = Blueprint("consumers", __name__, url_prefix="/api/consumers")

def generate_meter_number():
    """Generates a unique meter number."""
    return f"ELEC-{random.randint(10000, 99999)}"

@consumer_bp.route("", methods=["GET"])
@admin_required
def list_consumers():
    """
    List all consumers with search and status filtering (Admin only).
    Enriches each consumer with their latest meter reading and unpaid bills count.
    """
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip().lower()

    query = {"role": "consumer"}
    if status and status in ["active", "inactive"]:
        query["status"] = status

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"meter_number": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]

    users_coll = get_users_collection()
    bills_coll = get_bills_collection()

    consumers = list(users_coll.find(query).sort("created_at", -1))
    results = []

    for c in consumers:
        c_doc = serialize_doc(c)
        c_doc.pop("password_hash", None)

        # Find latest bill to get the latest reading
        latest_bill = bills_coll.find_one(
            {"user_id": c["_id"]},
            sort=[("created_at", -1)]
        )
        if latest_bill:
            c_doc["latest_reading"] = latest_bill.get("current_reading", 0)
            c_doc["last_billed_month"] = latest_bill.get("billing_month", "")
        else:
            c_doc["latest_reading"] = 0
            c_doc["last_billed_month"] = "Never Billed"

        # Count pending/overdue bills
        pending_count = bills_coll.count_documents({
            "user_id": c["_id"],
            "status": {"$in": ["PENDING", "OVERDUE"]}
        })
        c_doc["unpaid_bills_count"] = pending_count

        results.append(c_doc)

    return jsonify({"consumers": results, "count": len(results)}), 200

@consumer_bp.route("/<id>", methods=["GET"])
@token_required
def get_consumer(id):
    """
    Get consumer profile details. Accessible by admin or the consumer themselves.
    """
    users_coll = get_users_collection()
    bills_coll = get_bills_collection()

    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid consumer ID format."}), 400

    # Ensure consumer can only view their own profile, unless admin
    if g.current_user["role"] != "admin" and g.current_user["id"] != str(obj_id):
        return jsonify({"error": "Unauthorized access to consumer record."}), 403

    consumer = users_coll.find_one({"_id": obj_id, "role": "consumer"})
    if not consumer:
        return jsonify({"error": "Consumer not found."}), 404

    consumer_doc = serialize_doc(consumer)
    consumer_doc.pop("password_hash", None)

    # Attach recent bills
    bills = list(bills_coll.find({"user_id": obj_id}).sort("created_at", -1).limit(6))
    consumer_doc["recent_bills"] = serialize_docs(bills)

    return jsonify({"consumer": consumer_doc}), 200

@consumer_bp.route("", methods=["POST"])
@admin_required
def create_consumer():
    """
    Create a new consumer profile (Admin only).
    """
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "Consumer@123")
    address = data.get("address", "").strip()
    meter_number = data.get("meter_number", "").strip().upper()

    if not name or not email:
        return jsonify({"error": "Name and email are required fields."}), 400

    users_coll = get_users_collection()

    if users_coll.find_one({"email": email}):
        return jsonify({"error": "A user with this email address already exists."}), 409

    if meter_number:
        if users_coll.find_one({"meter_number": meter_number}):
            return jsonify({"error": f"Meter number '{meter_number}' is already assigned."}), 409
    else:
        while True:
            candidate = generate_meter_number()
            if not users_coll.find_one({"meter_number": candidate}):
                meter_number = candidate
                break

    new_user = {
        "name": name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "role": "consumer",
        "meter_number": meter_number,
        "address": address or "Address Not Provided",
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    }

    result = users_coll.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    created_doc = serialize_doc(new_user)
    created_doc.pop("password_hash", None)

    return jsonify({
        "message": "Consumer created successfully.",
        "consumer": created_doc
    }), 201

@consumer_bp.route("/<id>", methods=["PUT"])
@admin_required
def update_consumer(id):
    """
    Update consumer details (Admin only).
    """
    data = request.get_json() or {}
    users_coll = get_users_collection()

    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid consumer ID format."}), 400

    consumer = users_coll.find_one({"_id": obj_id, "role": "consumer"})
    if not consumer:
        return jsonify({"error": "Consumer not found."}), 404

    updates = {}
    if "name" in data and data["name"].strip():
        updates["name"] = data["name"].strip()
    if "email" in data and data["email"].strip():
        new_email = data["email"].strip().lower()
        existing = users_coll.find_one({"email": new_email, "_id": {"$ne": obj_id}})
        if existing:
            return jsonify({"error": "Email is already taken by another account."}), 409
        updates["email"] = new_email
    if "address" in data:
        updates["address"] = data["address"].strip()
    if "status" in data and data["status"] in ["active", "inactive"]:
        updates["status"] = data["status"]
    if "meter_number" in data and data["meter_number"].strip():
        new_meter = data["meter_number"].strip().upper()
        existing = users_coll.find_one({"meter_number": new_meter, "_id": {"$ne": obj_id}})
        if existing:
            return jsonify({"error": f"Meter number '{new_meter}' already in use."}), 409
        updates["meter_number"] = new_meter

    if updates:
        users_coll.update_one({"_id": obj_id}, {"$set": updates})

    updated = users_coll.find_one({"_id": obj_id})
    res_doc = serialize_doc(updated)
    res_doc.pop("password_hash", None)

    return jsonify({"message": "Consumer updated successfully.", "consumer": res_doc}), 200

@consumer_bp.route("/<id>/status", methods=["PATCH"])
@admin_required
def toggle_status(id):
    """
    Toggle consumer active / inactive status (Admin only).
    """
    users_coll = get_users_collection()
    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid consumer ID format."}), 400

    consumer = users_coll.find_one({"_id": obj_id, "role": "consumer"})
    if not consumer:
        return jsonify({"error": "Consumer not found."}), 404

    new_status = "inactive" if consumer.get("status") == "active" else "active"
    users_coll.update_one({"_id": obj_id}, {"$set": {"status": new_status}})

    return jsonify({
        "message": f"Consumer account has been set to {new_status}.",
        "status": new_status
    }), 200
