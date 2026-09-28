"""
Database Seeding Script for Electricity Bill Management System
Populates MongoDB with demo Admin, Consumers, Tariff slab rates, and Billing records.
"""

import sys
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash
from database import get_users_collection, get_bills_collection, get_tariffs_collection
from services.tariff_engine import calculate_bill_breakdown

# Handle Windows console encoding safely
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def seed_database():
    print("[INFO] Starting database seeding...")
    users_coll = get_users_collection()
    bills_coll = get_bills_collection()
    tariffs_coll = get_tariffs_collection()

    # 1. Clear existing demo data
    users_coll.delete_many({})
    bills_coll.delete_many({})
    tariffs_coll.delete_many({})
    print("[SUCCESS] Cleared existing collections.")

    # 2. Seed default Tariff
    default_tariff = {
        "tier_1_rate": 0.10,
        "tier_2_rate": 0.15,
        "tier_3_rate": 0.20,
        "fixed_charge": 5.00,
        "tax_rate": 0.05,
        "updated_at": datetime.now(timezone.utc)
    }
    tariffs_coll.insert_one(default_tariff)
    print("[SUCCESS] Inserted standard tariff slab config.")

    # 3. Seed Admin user
    admin_user = {
        "name": "Sarah Miller (Admin)",
        "email": "admin@utility.com",
        "password_hash": generate_password_hash("admin123"),
        "role": "admin",
        "meter_number": None,
        "address": "Utility HQ, Suite 100, Capital City",
        "status": "active",
        "created_at": datetime.now(timezone.utc) - timedelta(days=365)
    }
    admin_id = users_coll.insert_one(admin_user).inserted_id
    print(f"[SUCCESS] Created Admin: admin@utility.com / admin123 (ID: {admin_id})")

    # 4. Seed Consumers
    consumers_data = [
        {
            "name": "Alex Johnson",
            "email": "alex@example.com",
            "password": "consumer123",
            "meter_number": "ELEC-99201",
            "address": "123 Main Street, Suite 4B",
            "status": "active",
            "created_days_ago": 200
        },
        {
            "name": "Sophia Martinez",
            "email": "sophia@example.com",
            "password": "consumer123",
            "meter_number": "ELEC-44182",
            "address": "742 Evergreen Terrace, Apt 2",
            "status": "active",
            "created_days_ago": 180
        },
        {
            "name": "David Chen",
            "email": "david@example.com",
            "password": "consumer123",
            "meter_number": "ELEC-88319",
            "address": "550 Market Street, Floor 10",
            "status": "active",
            "created_days_ago": 150
        },
        {
            "name": "Emily Watson",
            "email": "emily@example.com",
            "password": "consumer123",
            "meter_number": "ELEC-12093",
            "address": "88 Elm Street, Unit 3",
            "status": "inactive",
            "created_days_ago": 90
        }
    ]

    consumer_map = {}
    for c in consumers_data:
        user_doc = {
            "name": c["name"],
            "email": c["email"],
            "password_hash": generate_password_hash(c["password"]),
            "role": "consumer",
            "meter_number": c["meter_number"],
            "address": c["address"],
            "status": c["status"],
            "created_at": datetime.now(timezone.utc) - timedelta(days=c["created_days_ago"])
        }
        res = users_coll.insert_one(user_doc)
        consumer_map[c["email"]] = res.inserted_id
        print(f"[SUCCESS] Created Consumer: {c['name']} ({c['meter_number']}) - {c['email']} / {c['password']}")

    # 5. Seed Bills for Alex Johnson (Past 6 months history + active bill)
    alex_id = consumer_map["alex@example.com"]
    alex_meter = "ELEC-99201"

    alex_history = [
        ("April 2026", 50, 210, 160, "PAID", 155),
        ("May 2026", 210, 400, 130, "PAID", 125),
        ("June 2026", 400, 710, 100, "PAID", 95),
        ("July 2026", 710, 980, 70, "PAID", 65),
        ("August 2026", 980, 1200, 40, "PAID", 35),
        ("September 2026", 1200, 1450, 250, "PENDING", None),  # Current active bill
    ]

    now = datetime.now(timezone.utc)

    for month, prev, curr, units, status, paid_offset in alex_history:
        bd = calculate_bill_breakdown(prev, curr, default_tariff)
        due_offset = 15 if status == "PENDING" else (paid_offset - 5)
        created_time = now - timedelta(days=due_offset + 15)
        due_date = (now - timedelta(days=due_offset)).strftime("%Y-%m-%d")
        paid_time = (now - timedelta(days=paid_offset)) if paid_offset else None

        bill_doc = {
            "user_id": alex_id,
            "meter_number": alex_meter,
            "billing_month": month,
            "previous_reading": prev,
            "current_reading": curr,
            "units_consumed": bd["units_consumed"],
            "energy_charge": bd["energy_charge"],
            "fixed_charge": bd["fixed_charge"],
            "tax": bd["tax"],
            "total_amount": bd["total_amount"],
            "due_date": due_date,
            "status": status,
            "paid_at": paid_time,
            "created_at": created_time
        }
        if status == "PAID":
            bill_doc["payment_details"] = {
                "transaction_id": f"TXN-HIST-{prev}-{curr}",
                "payment_method": "credit_card",
                "card_last4": "4242",
                "amount_paid": bd["total_amount"],
                "paid_at": paid_time.isoformat() if paid_time else None,
                "gateway_status": "SUCCESS"
            }
        bills_coll.insert_one(bill_doc)

    # 6. Seed bills for Sophia (one overdue, one pending)
    sophia_id = consumer_map["sophia@example.com"]
    bd_sophia_overdue = calculate_bill_breakdown(500, 840, default_tariff)
    bills_coll.insert_one({
        "user_id": sophia_id,
        "meter_number": "ELEC-44182",
        "billing_month": "August 2026",
        "previous_reading": 500,
        "current_reading": 840,
        "units_consumed": bd_sophia_overdue["units_consumed"],
        "energy_charge": bd_sophia_overdue["energy_charge"],
        "fixed_charge": bd_sophia_overdue["fixed_charge"],
        "tax": bd_sophia_overdue["tax"],
        "total_amount": bd_sophia_overdue["total_amount"],
        "due_date": (now - timedelta(days=10)).strftime("%Y-%m-%d"),
        "status": "OVERDUE",
        "paid_at": None,
        "created_at": now - timedelta(days=35)
    })

    bd_sophia_curr = calculate_bill_breakdown(840, 1020, default_tariff)
    bills_coll.insert_one({
        "user_id": sophia_id,
        "meter_number": "ELEC-44182",
        "billing_month": "September 2026",
        "previous_reading": 840,
        "current_reading": 1020,
        "units_consumed": bd_sophia_curr["units_consumed"],
        "energy_charge": bd_sophia_curr["energy_charge"],
        "fixed_charge": bd_sophia_curr["fixed_charge"],
        "tax": bd_sophia_curr["tax"],
        "total_amount": bd_sophia_curr["total_amount"],
        "due_date": (now + timedelta(days=18)).strftime("%Y-%m-%d"),
        "status": "PENDING",
        "paid_at": None,
        "created_at": now - timedelta(days=5)
    })

    # 7. Seed bill for David Chen
    david_id = consumer_map["david@example.com"]
    bd_david = calculate_bill_breakdown(100, 260, default_tariff)
    bills_coll.insert_one({
        "user_id": david_id,
        "meter_number": "ELEC-88319",
        "billing_month": "September 2026",
        "previous_reading": 100,
        "current_reading": 260,
        "units_consumed": bd_david["units_consumed"],
        "energy_charge": bd_david["energy_charge"],
        "fixed_charge": bd_david["fixed_charge"],
        "tax": bd_david["tax"],
        "total_amount": bd_david["total_amount"],
        "due_date": (now + timedelta(days=14)).strftime("%Y-%m-%d"),
        "status": "PAID",
        "paid_at": now - timedelta(days=2),
        "payment_details": {
            "transaction_id": "TXN-DAVID-0926",
            "payment_method": "upi",
            "amount_paid": bd_david["total_amount"],
            "paid_at": (now - timedelta(days=2)).isoformat(),
            "gateway_status": "SUCCESS"
        },
        "created_at": now - timedelta(days=10)
    })

    print("[SUCCESS] Database seeding completed successfully!")
    print("\nDemo Login Credentials:")
    print("  * Admin:    admin@utility.com  /  admin123")
    print("  * Consumer: alex@example.com   /  consumer123  (Meter: ELEC-99201)")
    print("  * Consumer: sophia@example.com /  consumer123  (Meter: ELEC-44182)")
    print("  * Consumer: david@example.com  /  consumer123  (Meter: ELEC-88319)")

if __name__ == "__main__":
    seed_database()
