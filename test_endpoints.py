import json
import urllib.request
import urllib.error

BASE = "http://localhost:5000/api"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP ERROR {e.code} on {path}: {err_msg}")
        raise

def test_all():
    print("[TEST] 1. Testing /health...")
    health = make_req("/health")
    print(f"  Health: {health['status']}, DB: {health['database']}")

    print("\n[TEST] 2. Testing Admin Login (admin@utility.com)...")
    admin_auth = make_req("/auth/login", method="POST", data={
        "identifier": "admin@utility.com",
        "password": "admin123"
    })
    admin_token = admin_auth["token"]
    print(f"  Logged in as: {admin_auth['user']['name']} ({admin_auth['user']['role']})")

    print("\n[TEST] 3. Testing Admin Metrics...")
    metrics = make_req("/admin/metrics", token=admin_token)
    print(f"  Revenue: ${metrics['metrics']['total_revenue']}")
    print(f"  Total Dues: ${metrics['metrics']['total_dues']}")
    print(f"  Active Meters: {metrics['metrics']['active_meters']}")
    print(f"  Pending Payments: {metrics['metrics']['pending_payments']}")

    print("\n[TEST] 4. Testing Live Calculate Preview (1200 -> 1450 = 250 units)...")
    calc = make_req("/admin/calculate-preview", method="POST", token=admin_token, data={
        "previous_reading": 1200,
        "current_reading": 1450
    })
    bd = calc["breakdown"]
    print(f"  Units: {bd['units_consumed']}")
    print(f"  Energy Charge: ${bd['energy_charge']} (Tier1: ${bd['tiers'][0]['cost']}, Tier2: ${bd['tiers'][1]['cost']})")
    print(f"  Fixed: ${bd['fixed_charge']}, Tax: ${bd['tax']}")
    print(f"  Total Amount: ${bd['total_amount']}")

    print("\n[TEST] 5. Testing Consumer Login with Meter Number ELEC-99201...")
    cons_auth = make_req("/auth/login", method="POST", data={
        "identifier": "ELEC-99201",
        "password": "consumer123"
    })
    c_token = cons_auth["token"]
    print(f"  Logged in Consumer: {cons_auth['user']['name']}, Meter: {cons_auth['user']['meter_number']}")

    print("\n[TEST] 6. Testing Consumer Bills List...")
    c_bills = make_req("/bills", token=c_token)
    print(f"  Total statements for consumer: {c_bills['count']}")
    first_bill = c_bills['bills'][0]
    print(f"  Active Bill: {first_bill['billing_month']} - ${first_bill['total_amount']} ({first_bill['status']})")

    print("\n[TEST] 7. Testing Consumer Analytics...")
    trends = make_req("/bills/analytics", token=c_token)
    print(f"  Monthly trend points: {len(trends['trends'])}")

    # Test paying the pending bill
    if first_bill['status'] == 'PENDING':
        print(f"\n[TEST] 8. Testing Simulated Payment for bill {first_bill['id']}...")
        pay_res = make_req(f"/bills/{first_bill['id']}/pay", method="POST", token=c_token, data={
            "payment_method": "credit_card",
            "card_last4": "4242"
        })
        print(f"  Payment Result: {pay_res['message']}, TXN: {pay_res['transaction_id']}")
        print(f"  Updated status: {pay_res['bill']['status']}")

    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    test_all()
