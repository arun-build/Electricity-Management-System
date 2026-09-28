# PowerGridHQ - Full-Stack Electricity Bill Management System

A production-grade, responsive full-stack Electricity Bill Management System with an **Admin Portal** (for meter reading entries, dynamic slab tariff configuration, consumer account management, and revenue analytics) and a **Consumer Portal** (for live balance tracking, simulated payment checkout, consumption analytics, and printable PDF statements).

---

## 🏗️ Architecture & Project Directory Structure

The project is organized into two completely separated, clean, and modular folders:

```
python/
├── backend/                        # Flask RESTful API Backend
│   ├── app.py                      # Main entrypoint, CORS, Blueprints, Health Check
│   ├── config.py                   # Environment configuration & JWT parameters
│   ├── database.py                 # PyMongo client & BSON serialization utilities
│   ├── requirements.txt            # Python dependencies (Flask, PyMongo, PyJWT, etc.)
│   ├── seed_data.py                # Database population script with realistic demo data
│   ├── services/
│   │   ├── __init__.py
│   │   └── tariff_engine.py        # Slab-based tariff calculation engine & live breakdowns
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth_middleware.py      # JWT authentication and Admin/Consumer route guards
│   └── routes/
│       ├── __init__.py
│       ├── auth_routes.py          # /api/auth: Login, Register, Profile, Token validation
│       ├── admin_routes.py         # /api/admin: System metrics, Tariff config, Bill generation
│       ├── consumer_routes.py      # /api/consumers: Profile management & status toggles
│       └── bill_routes.py          # /api/bills: Statements, Payment gateway, Analytics
│
├── frontend/                       # React.js (Vite) Single Page Application
│   ├── index.html                  # HTML5 application root & favicon
│   ├── vite.config.js              # Vite bundler configuration
│   ├── tailwind.config.js          # Tailwind CSS styling configuration (Dark Mode enabled)
│   ├── postcss.config.js           # PostCSS configuration
│   ├── package.json                # React, Lucide Icons, Recharts, Axios, Tailwind
│   └── src/
│       ├── main.jsx                # React DOM entry with AuthProvider & ThemeProvider
│       ├── App.jsx                 # App layout with responsive collapsible sidebar & views
│       ├── index.css               # Tailwind directives, custom scrollbars, print styles
│       ├── context/
│       │   ├── AuthContext.jsx     # JWT session management & auto-logout interceptor
│       │   └── ThemeContext.jsx    # Dark/Light mode state with localStorage persistence
│       ├── services/
│       │   └── api.js              # Axios client with automatic Bearer token injection
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx      # Top navigation with user details, badges, theme toggle
│       │   │   ├── Sidebar.jsx     # Responsive collapsible sidebar navigation
│       │   │   ├── StatCard.jsx    # Metric summary cards (Revenue, Dues, Meters, Dues)
│       │   │   ├── StatusBadge.jsx # Status pills (PAID, PENDING, OVERDUE, ACTIVE)
│       │   │   └── Modal.jsx       # Accessible modal dialog with backdrop blur
│       │   ├── consumer/
│       │   │   ├── HeroBillCard.jsx        # Highlighted active bill balance, due date, pay action
│       │   │   ├── ConsumptionChart.jsx    # Recharts Line/Bar chart for 6–12 months trend
│       │   │   ├── PaymentModal.jsx        # Simulated payment checkout (Card, UPI, Net Banking)
│       │   │   └── BillReceiptModal.jsx    # Printable/downloadable PDF billing invoice
│       │   └── admin/
│       │       ├── MeterReadingForm.jsx    # Live auto-calculating breakdown & bill generator
│       │       ├── ConsumerModal.jsx       # Create/Edit consumer profiles
│       │       └── TariffConfigModal.jsx   # Dynamic slab rates & tax configurator
│       └── pages/
│           ├── LoginPage.jsx               # SaaS sign-in & register with quick-fill demo buttons
│           ├── AdminDashboardPage.jsx      # Admin overview with metric cards & recent bills
│           ├── AdminConsumersPage.jsx      # Consumer table, search, filters, inline status toggles
│           ├── AdminBillsPage.jsx          # Meter reading entry & billing statements table
│           ├── AdminTariffsPage.jsx        # Tariff settings & interactive slab simulator
│           ├── ConsumerDashboardPage.jsx   # Consumer overview with hero card & analytics
│           └── ConsumerBillsPage.jsx       # Historical statements with print receipts & pay now
│
├── test_endpoints.py               # Automated end-to-end API test suite
└── README.md                       # Complete documentation & usage guide
```

---

## ⚡ Core Business Logic: Slab-Based Tariff Engine

The backend auto-calculates electricity costs based on consumed units (`units_consumed = current_reading - previous_reading`):

* **Tier 1 (0–100 units):** $0.10 / unit
* **Tier 2 (101–300 units):** $0.15 / unit
* **Tier 3 (301+ units):** $0.20 / unit
* **Fixed Charge:** $5.00
* **Tax Rate:** 5% on subtotal (`Energy Charge + Fixed Charge`)
* **Total Payable:** `(Energy Charge + Fixed Charge) * 1.05`

### Example Calculation (250 units):
- **Tier 1 (100 units @ $0.10):** $10.00
- **Tier 2 (150 units @ $0.15):** $22.50
- **Energy Charge:** $10.00 + $22.50 = **$32.50**
- **Fixed Utility Fee:** **$5.00**
- **Subtotal:** $32.50 + $5.00 = **$37.50**
- **State Tax (5%):** **$1.88**
- **Total Payable:** **$39.38** *(Matches specification document exactly)*

---

## 🔑 Demo Credentials (Pre-seeded)

Use the one-click **Quick-Fill** buttons on the login screen or enter manually:

| Role | Email / Identifier | Password | Meter Number | Account Details |
|---|---|---|---|---|
| **Admin** | `admin@utility.com` | `admin123` | *N/A (Staff)* | Full system administration |
| **Consumer 1** | `alex@example.com` or `ELEC-99201` | `consumer123` | `ELEC-99201` | 6 Months history + Active pending bill ($39.38) |
| **Consumer 2** | `sophia@example.com` or `ELEC-44182` | `consumer123` | `ELEC-44182` | Has an Overdue bill ($42.53) & Pending bill |
| **Consumer 3** | `david@example.com` or `ELEC-88319` | `consumer123` | `ELEC-88319` | Settled account |
| **Consumer 4** | `emily@example.com` or `ELEC-12093` | `consumer123` | `ELEC-12093` | Inactive status account |

---

## 🚀 Running the Project

### 1. Prerequisites
- **MongoDB:** Running locally on `mongodb://localhost:27017/` (or via MongoDB Atlas URI).
- **Python 3.10+**
- **Node.js 18+ and npm**

### 2. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo users, tariffs, and billing records
python seed_data.py

# Start Flask backend API (port 5000)
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
# Install packages
npm install

# Start Vite development server (port 5173)
npm run dev
```

### 4. Access the Application
Open your browser at:
👉 **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run the test suite from the project root:
```bash
.\backend\venv\Scripts\python test_endpoints.py
```
This tests:
1. Health check & MongoDB connection ping
2. Admin authentication & JWT token generation
3. Metric calculations (Revenue, Dues, Active meters, Pending bills)
4. Live auto-calculated tariff preview
5. Consumer authentication via unique Meter Number
6. Consumer bills retrieval & 6-month consumption analytics
7. Simulated payment gateway checkout & instant invoice receipt generation
