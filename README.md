### Bit N Build'26 🕷️🕸️🕷️

# EchoTrack AI

## AI-Powered Waste Management & Recycling Optimizer

EchoTrack AI  is an intelligent waste management platform designed to optimize waste collection, monitor smart bins, predict waste levels, dynamically plan collection routes, and improve recycling operations.

---

## 👥 Team

| Field | Value |
| :--- | :--- |
| **Team Name** | **TriByte** |
| **Team Lead** | **Jemit Vaghasiya** — [jemitvaghasiya07@gmail.com](mailto:jemitvaghasiya07@gmail.com) |
| **Members** | **Jay Sohaliya**, **Yug Bhensadaiya** |

---

## 🎯 Problem Statement

Municipalities, smart city planners, and private waste management operators lack an integrated, intelligent platform to monitor real-time bin fill levels, detect hazardous or overflow risks, and dynamically optimize waste collection routes. Operations currently rely on static schedules and manual logs, leading to:

- **Frequent Bin Overflows & Environmental Hazards:** Bins overflowing before scheduled pickups cause littering, severe odors, pest infestation, and public health risks.
- **Excessive Fuel & Fleet Operational Costs:** Collection trucks follow fixed, unoptimized routes, visiting empty or half-filled bins while missing critical high-fill bins.
- **Inefficient Waste Sorting & Low Recycling Yields:** Lack of real-time classification at the bin level delays recycling workflows and causes high cross-contamination rates between organic, recyclable, and hazardous waste.
- **Lack of Multi-Role Operational Synchronization:** Waste managers, field drivers, and data analysts lack a shared real-time system to dispatch vehicles, report field issues, and track fleet KPIs.

---

## 💡 Solution

**EchoTrack AI** is an end-to-end, AI-powered smart waste management and recycling optimization platform. It ingests real-time IoT bin telemetry, executes ML-driven fill-level prediction models, runs automated computer vision waste classification algorithms, and dynamically computes bin collection priority scores.

The platform automatically generates distance-optimized collection routes for field drivers, delivers real-time operational alerts (overflow warnings, fire/heat risks, sensor dropouts), and provides an interactive dashboard with multi-role access (**Waste Manager / Admin**, **Collection Driver**, and **Operations Analyst**).

---

## ✨ Features

- **Smart Bin Management** – Real-time IoT monitoring of fill levels, battery status, temperature, and GPS locations.
- **Real-Time Waste Monitoring** – Live telemetry tracking and active bin health monitoring across urban sectors.
- **Fill-Level Prediction** – ML forecasting algorithms predicting bin overflow timelines and daily fill rates.
- **Collection Priority Management** – Dynamic urgency scoring prioritizing overflowing and high-risk bins.
- **Collection Planning** – Automated generation of pickup manifests and optimized driver dispatch schedules.
- **Route Optimization** – Distance and time optimized routes for collection trucks to reduce fuel consumption and carbon footprint.
- **Vehicle & Fleet Management** – Fleet tracking, capacity utilization %, fuel monitoring, and driver assignments.
- **Operational Alerts** – Real-time event notifications (Overflow Warnings, High Temperature, Sensor Dropouts, Route Delays).
- **Analytics & Reports** – Operational performance metrics, waste generation trends, and fleet efficiency breakdown charts.
- **AI-Based Waste Insights** – Actionable recommendations for municipal waste reduction and recycling improvement.
- **Role-Based Access Control (RBAC)** – Multi-tiered security for Admin, Driver, and Analyst roles.

---

## 👥 User Roles

- **Admin / Waste Manager** – Manage the complete waste management system, fleet dispatch, bin deployment, user creation, and system settings.
- **Driver / Field Worker** – Manage assigned routes, turn-by-turn bin pickup lists, route map, and waste collection completion.
- **Analyst / Supervisor** – Analyze waste composition, collection trends, vehicle efficiency, and operational data reports.

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- Lucide React

### Backend
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication

### AI / ML
- Machine Learning
- Waste Prediction
- Waste Classification
- Route Optimization
- AI-Based Analytics

---

## 📁 Repository Structure

```text
├── backend/                              # FastAPI + Python Async Backend
│   ├── alembic/                          # Alembic database migration scripts
│   │   └── versions/                     # DB Schema migration revisions
│   ├── app/
│   │   ├── api/                          # FastAPI REST API Layer
│   │   │   ├── routes/                   # Route Handlers
│   │   │   │   ├── alerts.py             # Operational alerts & resolution endpoints
│   │   │   │   ├── auth.py               # JWT Login, Register & Session endpoints
│   │   │   │   ├── bins.py               # Smart bin management & telemetry endpoints
│   │   │   │   ├── classification.py     # AI waste classification inference endpoints
│   │   │   │   ├── monitoring.py         # Real-time bin monitoring & predictions
│   │   │   │   ├── routes.py             # Route planning & optimization endpoints
│   │   │   │   ├── users.py              # User management & admin RBAC endpoints
│   │   │   │   └── vehicles.py           # Fleet vehicle tracking endpoints
│   │   │   └── router.py                 # API main router aggregation
│   │   ├── classification/               # Machine Learning classification package
│   │   │   ├── engine.py                 # Core AI classification engine logic
│   │   │   └── mock_engine.py            # Simulated ML inference pipeline
│   │   ├── core/                         # Core app settings, JWT & security logic
│   │   ├── db/                           # Async Database session & Base ORM declarative
│   │   ├── models/                       # SQLAlchemy Database Models (Bin, Route, Vehicle, User, Alert, Classification)
│   │   ├── schemas/                      # Pydantic schemas for data validation
│   │   ├── services/                     # Business logic (alert service, route planning, classification)
│   │   ├── seed.py                       # DB Seeding script for mock urban dataset
│   │   └── main.py                       # FastAPI entry point & CORS configuration
│   ├── tests/                            # Automated Pytest suite
│   ├── alembic.ini                       # Database migration configuration
│   └── requirements.txt                  # Python dependencies
│
├── frontend/                             # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/                   # React UI Components
│   │   │   ├── admin/                    # Admin Dashboard, Bins, Monitoring, Planning, Settings, Users
│   │   │   ├── driver/                   # Driver Portal, Route details, Stop completion
│   │   │   ├── analytics/                # Analytics charts & performance metrics
│   │   │   ├── alerts/                   # Alert center & activity timeline
│   │   │   ├── auth/                     # Authentication & Sign-in UI
│   │   │   └── common/                   # Shared UI Toast, Modal, ScrollToTop, Nav
│   │   ├── services/                     # Frontend API Client Services (auth, bins, routes, etc.)
│   │   ├── types/                        # TypeScript Interfaces & Types
│   │   ├── mock/                         # Fallback mock datasets & demo data
│   │   ├── App.tsx                       # App Root, Role Router & State Handlers
│   │   └── main.tsx                      # Vite React entry point
│   ├── package.json                      # Frontend dependencies & scripts
│   └── vite.config.ts                    # Vite build configuration
│
├── demo/                                 # Project Media & Submissions
│   ├── Screenshot/                       # UI & Operational Screenshots
│   ├── Presentation/                     # Hackathon Slide Deck / Pitch Presentation
│   └── Video_Link/                       # Video Demo Links & Resources
│
└── README.md                             # Project Main Documentation
```

---

## ⚡ How to Run & Setup

### Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (v3.10+)
- **PostgreSQL** (running locally or remote instance)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Vaghasiya-Jemit-kanaiyalal/Bit-n-Build-26-TriByte.git
cd Bit-n-Build-26-TriByte
```

---

### 2. Backend Setup (FastAPI & PostgreSQL)

```bash
# Navigate to backend directory
cd backend

# Create & activate a virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment configuration file
cp .env.example .env
# Edit .env and set your DATABASE_URL (e.g. postgresql+asyncpg://postgres:password@localhost:5432/wastewise)

# Run database migrations with Alembic
alembic upgrade head

# Seed the database with sample urban bins, routes, vehicles, and users
python -m app.seed

# Start the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
> Backend API docs will be live at: **`http://localhost:8000/docs`**

---

### 3. Frontend Setup (React + Vite)

Open a new terminal window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
> Web application will be accessible at: **`http://localhost:5173`**

---

### 🔑 Demo Accounts (Default Seed Credentials)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Waste Manager (Admin)** | `admin@gmail.com` | `admin123` | Full System Management, Fleet & Bins Control |
| **Collection Driver** | `driver@driver.gmail.com` | `driver123` | Driver Portal, Route Guidance & Pickup Tasks |
| **Operations Analyst** | `analyst@analyst.gmail.com` | `analyst123` | Operations Analytics, Reports & Classification Insights |
