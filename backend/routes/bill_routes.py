from datetime import datetime, timezone
import random
from flask import Blueprint, request, jsonify, g
from bson import ObjectId

from database import get_bills_collection, get_users_collection, serialize_doc, serialize_docs
from middleware.auth_middleware import token_required
from services.tariff_engine import calculate_bill_breakdown

bill_bp = Blueprint("bills", __name__, url_prefix="/api/bills")

def generate_transaction_id():
    """Generates a realistic transaction reference code."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    rand_suffix = random.randint(1000, 9999)
    return f"TXN-{timestamp}-{rand_suffix}"

@bill_bp.route("", methods=["GET"])
@token_required
def get_bills():
    """
    List billing statements.
    - Consumers see only their own bills.
    - Admins can query all bills, filter by status, search by meter/consumer, or filter by month.
    """
    bills_coll = get_bills_collection()
    users_coll = get_users_collection()

    user_role = g.current_user["role"]
    query = {}

    if user_role == "consumer":
        query["user_id"] = ObjectId(g.current_user["id"])
    else:
        # Admin filters
        status = request.args.get("status", "").strip().upper()
        if status and status in ["PENDING", "PAID", "OVERDUE"]:
            query["status"] = status

        month = request.args.get("month", "").strip()
        if month:
            query["billing_month"] = {"$regex": month, "$options": "i"}

        meter_number = request.args.get("meter_number", "").strip().upper()
        if meter_number:
            query["meter_number"] = {"$regex": meter_number, "$options": "i"}

        consumer_id = request.args.get("consumer_id", "").strip()
        if consumer_id:
            try:
                query["user_id"] = ObjectId(consumer_id)
            except Exception:
                pass

    bills = list(bills_coll.find(query).sort("created_at", -1))

    # Enrich bills with user details for clear table representation
    enriched_bills = []
    user_cache = {}

    for b in bills:
        doc = serialize_doc(b)
        uid_str = str(b.get("user_id"))

        if uid_str not in user_cache:
            user = users_coll.find_one({"_id": b.get("user_id")})
            if user:
                user_cache[uid_str] = {
                    "consumer_name": user.get("name"),
                    "consumer_email": user.get("email"),
                    "consumer_address": user.get("address")
                }
            else:
                user_cache[uid_str] = {
                    "consumer_name": "Unknown",
                    "consumer_email": "",
                    "consumer_address": ""
                }

        doc.update(user_cache[uid_str])
        enriched_bills.append(doc)

    return jsonify({"bills": enriched_bills, "count": len(enriched_bills)}), 200

@bill_bp.route("/analytics", methods=["GET"])
@token_required
def get_analytics():
    """
    Returns monthly consumption trend data for charts.
    - If consumer: returns their historical consumption (past 6-12 months).
    - If admin: can view specific consumer by ?meter_number or aggregate system data.
    """
    bills_coll = get_bills_collection()
    user_role = g.current_user["role"]

    query = {}
    if user_role == "consumer":
        query["user_id"] = ObjectId(g.current_user["id"])
    else:
        meter_number = request.args.get("meter_number", "").strip().upper()
        consumer_id = request.args.get("consumer_id", "").strip()
        if meter_number:
            query["meter_number"] = meter_number
        elif consumer_id:
            try:
                query["user_id"] = ObjectId(consumer_id)
            except Exception:
                pass

    # Retrieve bills sorted chronologically by created_at
    bills = list(bills_coll.find(query).sort("created_at", 1).limit(12))

    trend_data = []
    for b in bills:
        trend_data.append({
            "billing_month": b.get("billing_month", "Unknown"),
            "units_consumed": b.get("units_consumed", 0),
            "energy_charge": b.get("energy_charge", 0.0),
            "total_amount": b.get("total_amount", 0.0),
            "status": b.get("status", "PENDING"),
            "meter_number": b.get("meter_number", "")
        })

    return jsonify({"trends": trend_data}), 200

@bill_bp.route("/<id>", methods=["GET"])
@token_required
def get_bill_detail(id):
    """
    Get detailed bill receipt information.
    """
    bills_coll = get_bills_collection()
    users_coll = get_users_collection()

    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid bill ID format."}), 400

    bill = bills_coll.find_one({"_id": obj_id})
    if not bill:
        return jsonify({"error": "Bill not found."}), 404

    # Authorization check
    if g.current_user["role"] != "admin" and str(bill["user_id"]) != g.current_user["id"]:
        return jsonify({"error": "Unauthorized to view this billing statement."}), 403

    user = users_coll.find_one({"_id": bill["user_id"]})
    user_data = serialize_doc(user) if user else {}
    if user_data:
        user_data.pop("password_hash", None)

    bill_data = serialize_doc(bill)
    bill_data["consumer"] = user_data

    # Generate slab breakdown for the receipt
    breakdown = calculate_bill_breakdown(bill.get("previous_reading", 0), bill.get("current_reading", 0))
    bill_data["breakdown"] = breakdown

    return jsonify({"bill": bill_data}), 200

@bill_bp.route("/<id>/pay", methods=["POST"])
@token_required
def pay_bill(id):
    """
    Simulated payment checkout gateway endpoint.
    Accepts payment method, marks bill as PAID, and generates receipt.
    """
    bills_coll = get_bills_collection()

    try:
        obj_id = ObjectId(id)
    except Exception:
        return jsonify({"error": "Invalid bill ID format."}), 400

    bill = bills_coll.find_one({"_id": obj_id})
    if not bill:
        return jsonify({"error": "Bill not found."}), 404

    # Authorization check
    if g.current_user["role"] != "admin" and str(bill["user_id"]) != g.current_user["id"]:
        return jsonify({"error": "Unauthorized to pay this bill."}), 403

    if bill.get("status") == "PAID":
        return jsonify({"error": "This bill has already been paid.", "bill": serialize_doc(bill)}), 400

    data = request.get_json() or {}
    payment_method = data.get("payment_method", "credit_card")
    card_last4 = data.get("card_last4", "4242")
    transaction_id = data.get("transaction_id") or generate_transaction_id()

    now = datetime.now(timezone.utc)
    payment_record = {
        "transaction_id": transaction_id,
        "payment_method": payment_method,
        "card_last4": card_last4 if payment_method in ["credit_card", "debit_card"] else None,
        "amount_paid": bill.get("total_amount", 0.0),
        "paid_at": now.isoformat(),
        "gateway_status": "SUCCESS"
    }

    bills_coll.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "status": "PAID",
                "paid_at": now,
                "payment_details": payment_record
            }
        }
    )

    updated_bill = bills_coll.find_one({"_id": obj_id})

    return jsonify({
        "message": "Payment processed successfully.",
        "transaction_id": transaction_id,
        "bill": serialize_doc(updated_bill)
    }), 200
