"""
Slab-Based Tariff Engine Service

Calculates electricity costs based on consumed units and configured slab tiers:
- Tier 1 (0–100 units): $0.10 / unit
- Tier 2 (101–300 units): $0.15 / unit
- Tier 3 (301+ units): $0.20 / unit
- Fixed Charge: $5.00
- Tax Rate: 5% on (Energy Charge + Fixed Charge)
- Total Payable: (Energy Charge + Fixed Charge) * 1.05
"""

from datetime import datetime, timezone
from database import get_tariffs_collection

DEFAULT_TARIFF = {
    "tier_1_rate": 0.10,
    "tier_2_rate": 0.15,
    "tier_3_rate": 0.20,
    "fixed_charge": 5.00,
    "tax_rate": 0.05
}

def get_active_tariff():
    """
    Fetches the current active tariff from MongoDB.
    Falls back to default tariff specification if none exists.
    """
    tariffs_coll = get_tariffs_collection()
    tariff = tariffs_coll.find_one(sort=[("updated_at", -1)])
    if not tariff:
        return DEFAULT_TARIFF.copy()
    
    return {
        "tier_1_rate": float(tariff.get("tier_1_rate", DEFAULT_TARIFF["tier_1_rate"])),
        "tier_2_rate": float(tariff.get("tier_2_rate", DEFAULT_TARIFF["tier_2_rate"])),
        "tier_3_rate": float(tariff.get("tier_3_rate", DEFAULT_TARIFF["tier_3_rate"])),
        "fixed_charge": float(tariff.get("fixed_charge", DEFAULT_TARIFF["fixed_charge"])),
        "tax_rate": float(tariff.get("tax_rate", DEFAULT_TARIFF["tax_rate"]))
    }

def update_active_tariff(tier_1_rate, tier_2_rate, tier_3_rate, fixed_charge, tax_rate):
    """
    Updates or inserts the active tariff configuration in MongoDB.
    """
    tariffs_coll = get_tariffs_collection()
    tariff_data = {
        "tier_1_rate": round(float(tier_1_rate), 4),
        "tier_2_rate": round(float(tier_2_rate), 4),
        "tier_3_rate": round(float(tier_3_rate), 4),
        "fixed_charge": round(float(fixed_charge), 2),
        "tax_rate": round(float(tax_rate), 4),
        "updated_at": datetime.now(timezone.utc)
    }
    result = tariffs_coll.insert_one(tariff_data)
    tariff_data["_id"] = str(result.inserted_id)
    tariff_data["id"] = str(result.inserted_id)
    tariff_data["updated_at"] = tariff_data["updated_at"].isoformat()
    return tariff_data

def calculate_bill_breakdown(previous_reading, current_reading, custom_tariff=None):
    """
    Calculates detailed bill breakdown given meter readings and tariff.
    
    Args:
        previous_reading (float/int): Meter reading at start of billing cycle.
        current_reading (float/int): Meter reading at end of billing cycle.
        custom_tariff (dict, optional): Tariff override if provided.
        
    Returns:
        dict: Detailed breakdown containing units, tier breakdowns, energy charge,
              fixed charge, tax, and total amount payable.
    """
    prev = float(previous_reading or 0)
    curr = float(current_reading or 0)
    
    if curr < prev:
        raise ValueError("Current reading cannot be lower than previous reading.")
        
    units_consumed = round(curr - prev, 2)
    tariff = custom_tariff if custom_tariff else get_active_tariff()
    
    tier_1_rate = tariff["tier_1_rate"]
    tier_2_rate = tariff["tier_2_rate"]
    tier_3_rate = tariff["tier_3_rate"]
    fixed_charge = tariff["fixed_charge"]
    tax_rate = tariff["tax_rate"]
    
    # Slab tier calculations:
    # Tier 1: 0 - 100 units
    tier_1_units = min(units_consumed, 100.0)
    tier_1_cost = round(tier_1_units * tier_1_rate, 2)
    
    # Tier 2: 101 - 300 units (max 200 units in this tier)
    tier_2_units = min(max(units_consumed - 100.0, 0.0), 200.0)
    tier_2_cost = round(tier_2_units * tier_2_rate, 2)
    
    # Tier 3: 301+ units
    tier_3_units = max(units_consumed - 300.0, 0.0)
    tier_3_cost = round(tier_3_units * tier_3_rate, 2)
    
    # Energy charge sum
    energy_charge = round(tier_1_cost + tier_2_cost + tier_3_cost, 2)
    
    # Subtotal for tax application (Energy Charge + Fixed Charge)
    subtotal = round(energy_charge + fixed_charge, 2)
    tax = round(subtotal * tax_rate, 2)
    total_amount = round(subtotal + tax, 2)
    
    return {
        "previous_reading": prev,
        "current_reading": curr,
        "units_consumed": units_consumed,
        "tiers": [
            {
                "tier": "Tier 1 (0–100 kWh)",
                "units": tier_1_units,
                "rate": tier_1_rate,
                "cost": tier_1_cost
            },
            {
                "tier": "Tier 2 (101–300 kWh)",
                "units": tier_2_units,
                "rate": tier_2_rate,
                "cost": tier_2_cost
            },
            {
                "tier": "Tier 3 (301+ kWh)",
                "units": tier_3_units,
                "rate": tier_3_rate,
                "cost": tier_3_cost
            }
        ],
        "energy_charge": energy_charge,
        "fixed_charge": fixed_charge,
        "tax_rate_percent": round(tax_rate * 100, 2),
        "tax": tax,
        "total_amount": total_amount
    }
