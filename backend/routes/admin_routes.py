from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, g
from bson import ObjectId

from database import get_bills_collection, get_users_collection, serialize_doc, serialize_docs
from middleware.auth_middleware import admin_required
from services.tariff_engine import (
    get_active_tariff,
    update_active_tariff,
    calculate_bill_breakdown
)

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/metrics", methods=["GET"])
@admin_required
def get_metrics():
    """
    Returns top-level system metrics summary:
    - Total Revenue Collected
    - Total Outstanding Dues
    - Total Active Meters
    - Total Inactive Meters
    - Pending Payments Count
    - Overdue Payments Count
    """
    bills_coll = get_bills_collection()
    users_coll = get_users_collection()

    # Active and total meters
    active_meters_count = users_coll.count_documents({"role": "consumer", "status": "active"})
    inactive_meters_count = users_coll.count_documents({"role": "consumer", "status": "inactive"})
    total_consumers_count = users_coll.count_documents({"role": "consumer"})

    # Bills counts by status
    pending_count = bills_coll.count_documents({"status": "PENDING"})
    overdue_count = bills_coll.count_documents({"status": "OVERDUE"})
    paid_count = bills_coll.count_documents({"status": "PAID"})

    # Aggregate revenue & dues
    revenue_pipeline = [
        {"$match": {"status": "PAID"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_res = list(bills_coll.aggregate(revenue_pipeline))
    total_revenue = round(revenue_res[0]["total"], 2) if revenue_res else 0.0

    dues_pipeline = [
        {"$match": {"status": {"$in": ["PENDING", "OVERDUE"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    dues_res = list(bills_coll.aggregate(dues_pipeline))
    total_dues = round(dues_res[0]["total"], 2) if dues_res else 0.0

    # Total units consumed across all time
    units_pipeline = [
        {"$group": {"_id": None, "total_units": {"$sum": "$units_consumed"}}}
    ]
    units_res = list(bills_coll.aggregate(units_pipeline))
    total_units_consumed = round(units_res[0]["total_units"], 2) if units_res else 0.0

    return jsonify({
        "metrics": {
            "total_revenue": total_revenue,
            "total_dues": total_dues,
            "active_meters": active_meters_count,
            "inactive_meters": inactive_meters_count,
            "total_consumers": total_consumers_count,
            "pending_payments": pending_count,
            "overdue_payments": overdue_count,
            "paid_payments": paid_count,
            "total_units_consumed": total_units_consumed
        }
    }), 200

@admin_bp.route("/tariffs", methods=["GET"])
@admin_required
def get_tariffs():
    """
    Get active tariff slab configuration.
    """
    tariff = get_active_tariff()
    return jsonify({"tariff": tariff}), 200

@admin_bp.route("/tariffs", methods=["PUT"])
@admin_required
def update_tariffs():
    """
    Configure dynamic tariff slab rates ($/kWh), fixed fees, and tax percentage.
    """
    data = request.get_json() or {}
    try:
        tier_1 = float(data.get("tier_1_rate", 0.10))
        tier_2 = float(data.get("tier_2_rate", 0.15))
        tier_3 = float(data.get("tier_3_rate", 0.20))
        fixed = float(data.get("fixed_charge", 5.00))
        tax = float(data.get("tax_rate", 0.05))

        if any(v < 0 for v in [tier_1, tier_2, tier_3, fixed, tax]):
            return jsonify({"error": "Rates and charges must be non-negative values."}), 400

        updated = update_active_tariff(tier_1, tier_2, tier_3, fixed, tax)
        return jsonify({"message": "Tariff settings updated successfully.", "tariff": updated}), 200
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid numerical inputs: {str(e)}"}), 400

@admin_bp.route("/calculate-preview", methods=["POST"])
@admin_required
def calculate_preview():
    """
    Returns live auto-calculated breakdown given previous and current meter readings.
    Used for live interactive calculation in the Admin bill generator form.
    """
    data = request.get_json() or {}
    try:
        previous_reading = float(data.get("previous_reading", 0))
        current_reading = float(data.get("current_reading", 0))

        if current_reading < previous_reading:
            return jsonify({"error": "Current reading cannot be less than previous reading."}), 400

        breakdown = calculate_bill_breakdown(previous_reading, current_reading)
        return jsonify({"breakdown": breakdown}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Calculation failed: {str(e)}"}), 400

@admin_bp.route("/generate-bill", methods=["POST"])
@admin_required
def generate_bill():
    """
    Generate and persist a new monthly electricity bill for a consumer.
    """
    data = request.get_json() or {}
    consumer_id = data.get("consumer_id", "").strip()
    meter_number = data.get("meter_number", "").strip().upper()
    current_reading_raw = data.get("current_reading")
    billing_month = data.get("billing_month", "").strip()
    due_date_str = data.get("due_date", "").strip()

    if current_reading_raw is None:
        return jsonify({"error": "Current reading is required."}), 400

    try:
        current_reading = float(current_reading_raw)
    except (ValueError, TypeError):
        return jsonify({"error": "Current reading must be a valid number."}), 400

    users_coll = get_users_collection()
    bills_coll = get_bills_collection()

    # Identify consumer
    consumer = None
    if consumer_id:
        try:
            consumer = users_coll.find_one({"_id": ObjectId(consumer_id), "role": "consumer"})
        except Exception:
            pass

    if not consumer and meter_number:
        consumer = users_coll.find_one({"meter_number": meter_number, "role": "consumer"})

    if not consumer:
        return jsonify({"error": "Consumer not found. Please provide a valid Consumer ID or Meter Number."}), 404

    if consumer.get("status") == "inactive":
        return jsonify({"error": "Cannot generate bill for an inactive consumer account."}), 400

    # Auto-detect previous reading from latest bill if not supplied
    previous_reading_input = data.get("previous_reading")
    if previous_reading_input is not None:
        try:
            previous_reading = float(previous_reading_input)
        except (ValueError, TypeError):
            return jsonify({"error": "Previous reading must be a valid number."}), 400
    else:
        latest_bill = bills_coll.find_one(
            {"user_id": consumer["_id"]},
            sort=[("created_at", -1)]
        )
        previous_reading = float(latest_bill.get("current_reading", 0)) if latest_bill else 0.0

    if current_reading < previous_reading:
        return jsonify({
            "error": f"Current reading ({current_reading}) cannot be less than previous reading ({previous_reading})."
        }), 400

    # Determine billing month if not provided (e.g., 'September 2026')
    now = datetime.now(timezone.utc)
    if not billing_month:
        billing_month = now.strftime("%B %Y")

    # Due date defaults to 15 days in future if not provided
    if not due_date_str:
        due_date = (now + timedelta(days=15)).strftime("%Y-%m-%d")
    else:
        due_date = due_date_str

    # Execute tariff engine calculation
    breakdown = calculate_bill_breakdown(previous_reading, current_reading)

    bill_document = {
        "user_id": consumer["_id"],
        "meter_number": consumer.get("meter_number"),
        "billing_month": billing_month,
        "previous_reading": breakdown["previous_reading"],
        "current_reading": breakdown["current_reading"],
        "units_consumed": breakdown["units_consumed"],
        "energy_charge": breakdown["energy_charge"],
        "fixed_charge": breakdown["fixed_charge"],
        "tax": breakdown["tax"],
        "total_amount": breakdown["total_amount"],
        "due_date": due_date,
        "status": "PENDING",
        "paid_at": None,
        "created_at": now
    }

    result = bills_coll.insert_one(bill_document)
    bill_document["_id"] = result.inserted_id

    created_bill = serialize_doc(bill_document)
    created_bill["consumer_name"] = consumer.get("name")
    created_bill["breakdown"] = breakdown

    return jsonify({
        "message": f"Bill for {billing_month} generated successfully.",
        "bill": created_bill
    }), 201
