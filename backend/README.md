# WasteWise AI - Backend Authentication System

> AI-Powered Waste Management & Recycling Optimizer  
> Backend Authentication & Role-Based Access Control (RBAC) Foundation

Built with:
- **FastAPI**
- **PostgreSQL 18** + **asyncpg**
- **SQLAlchemy 2.0 (Async ORM)**
- **Alembic** (Database Migrations)
- **Pydantic v2** & **Pydantic Settings**
- **JWT Authentication** (Short-lived Access & Long-lived Refresh Tokens)
- **Argon2id** (State-of-the-art Password Hashing)

---

## 1. Architecture & Roles

WasteWise AI enforces role-based access control across three primary actors:

| Role Code | Frontend Display Name | Description | Signup Policy |
|:---|:---|:---|:---|
| `ADMIN` | **Waste Manager / Admin** | Full access to central management, user administration, reports, fleet dispatch. | Protected (via seed script or `ALLOW_ADMIN_SELF_SIGNUP=true`) |
| `DRIVER` | **Driver / Field Worker** | Field operations, route navigation, bin pickup updates. | Public signup permitted |
| `ANALYST` | **Analyst / Supervisor** | Analytics dashboards, fill-level telemetry, recycling metrics. | Public signup permitted |

---

## 2. Quickstart & Local Setup

### Prerequisites
- Python 3.11+ (Tested on Python 3.14.2)
- PostgreSQL 18+ running on `localhost:5432`

### Step 1: Create Database
In `psql` or pgAdmin:
```sql
CREATE DATABASE wastewise;
CREATE DATABASE wastewise_test;
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` matches your local database credentials:
```ini
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/wastewise
TEST_DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/wastewise_test
JWT_SECRET_KEY=change-this-in-production-minimum-32-chars-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=30
ALLOW_ADMIN_SELF_SIGNUP=false
FRONTEND_URL=http://localhost:5173
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Apply Database Migrations (Alembic)
```bash
python -m alembic upgrade head
```

### Step 5: Seed Demo Accounts
Run the standalone CLI seed command:
```bash
python -m app.seed
```

This creates pre-configured demo users:
- **Admin**: `admin@wastewise.ai` | Password: `Admin@WasteWise2026!`
- **Driver**: `driver@wastewise.ai` | Password: `Driver@WasteWise2026!`
- **Analyst**: `analyst@wastewise.ai` | Password: `Analyst@WasteWise2026!`

### Step 6: Start FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`
- Health Probe: `http://localhost:8000/health`
- Database Probe: `http://localhost:8000/health/db`

---

## 3. Alembic Migration Workflow

Alembic controls all database schema alterations. **Never manually alter database tables.**

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Change Model   │ ──> │ alembic autogenerate │ ──> │ Review Migration    │ ──> │ alembic upgrade  │
│  (models/*.py)  │     │                      │     │ (alembic/versions/) │     │ head             │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘     └──────────────────┘
```

### Workflow Steps:
1. **Modify SQLAlchemy Model**:
   Edit `app/models/user.py` or add new models in `app/models/`.
2. **Generate Migration**:
   ```bash
   python -m alembic revision --autogenerate -m "describe your changes"
   ```
3. **Inspect the Generated Script**:
   Open the new file in `alembic/versions/` and verify the `upgrade()` and `downgrade()` operations.
4. **Apply Migration**:
   ```bash
   python -m alembic upgrade head
   ```
5. **Verify Status**:
   ```bash
   python -m alembic current
   python -m alembic check
   ```

---

## 4. Frontend Integration Guide (React / Vite)

### Auth Flow & Redirection Architecture

```
[ Signup Screen ]
       │
       ▼
POST /api/v1/auth/register  ──> 201 Created ──> Navigate to /login

[ Login Screen ]
       │
       ▼
POST /api/v1/auth/login ──> { access_token, refresh_token, user }
       │
       ├─► Store access_token in memory / Auth Context
       ├─► Store refresh_token in secure storage / httpOnly cookie
       │
       ▼
Check user.role:
   ├── "ADMIN"   ──> Navigate to /admin/dashboard
   ├── "DRIVER"  ──> Navigate to /driver/dashboard
   └── "ANALYST" ──> Navigate to /analyst/dashboard

[ Page Refresh / App Boot ]
       │
       ▼
GET /api/v1/auth/me (with Authorization: Bearer <access_token>)
   ├── 200 OK  ──> Restore session & role
   └── 401 Unauthorized ──>
          POST /api/v1/auth/refresh { refresh_token }
             ├── 200 OK  ──> Save new access_token & retry /auth/me
             └── 401/403 ──> Clear storage & Redirect to /login
```

---

## 5. Exact REST API Contract

All endpoints are versioned under prefix `/api/v1`.

### 1. Register Account
`POST /api/v1/auth/register`

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "full_name": "Jane Doe",
    "email": "jane@wastewise.ai",
    "organization": "Metro District #4",
    "role": "ANALYST",
    "password": "SecurePassword123!"
  }
  ```
- **Validation Rules**:
  - `email`: Valid email syntax (automatically normalized to lowercase).
  - `role`: Must be `"DRIVER"` or `"ANALYST"`. (`"ADMIN"` is rejected unless `ALLOW_ADMIN_SELF_SIGNUP=true`).
  - `password`: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Account created successfully.",
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "full_name": "Jane Doe",
      "email": "jane@wastewise.ai",
      "organization": "Metro District #4",
      "role": "ANALYST",
      "is_active": true,
      "is_verified": false,
      "created_at": "2026-09-19T13:30:00Z",
      "last_login_at": null
    }
  }
  ```
- **Error Responses**:
  - `409 Conflict`: `{"detail": "A user with this email address already exists."}`
  - `403 Forbidden`: `{"detail": "Public registration for the ADMIN role is disabled. Contact system administrator."}`
  - `422 Unprocessable Content`: Validation failure details.

---

### 2. Login
`POST /api/v1/auth/login`

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "admin@wastewise.ai",
    "password": "Admin@WasteWise2026!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "c9784bc5-d5ee-4dff-92bb-4d512f876faf",
      "full_name": "Waste Manager (Admin)",
      "email": "admin@wastewise.ai",
      "organization": "WasteWise Central HQ",
      "role": "ADMIN",
      "is_active": true,
      "is_verified": true,
      "created_at": "2026-09-19T07:50:29Z",
      "last_login_at": "2026-09-19T13:35:00Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Invalid email or password."}` (Generic message to prevent email enumeration).
  - `403 Forbidden`: `{"detail": "Account is disabled. Please contact support."}`

---

### 3. Get Current User Profile
`GET /api/v1/auth/me` or `GET /api/v1/users/me`

- **Headers**: `Authorization: Bearer <access_token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": "c9784bc5-d5ee-4dff-92bb-4d512f876faf",
    "full_name": "Waste Manager (Admin)",
    "email": "admin@wastewise.ai",
    "organization": "WasteWise Central HQ",
    "role": "ADMIN",
    "is_active": true,
    "is_verified": true,
    "created_at": "2026-09-19T07:50:29Z",
    "last_login_at": "2026-09-19T13:35:00Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Could not validate credentials: ..."}`
  - `403 Forbidden`: `{"detail": "User account is inactive."}`

---

### 4. Refresh Access Token
`POST /api/v1/auth/refresh`

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "c9784bc5-d5ee-4dff-92bb-4d512f876faf",
      "full_name": "Waste Manager (Admin)",
      "email": "admin@wastewise.ai",
      "organization": "WasteWise Central HQ",
      "role": "ADMIN",
      "is_active": true,
      "is_verified": true,
      "created_at": "2026-09-19T07:50:29Z",
      "last_login_at": "2026-09-19T13:35:00Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: `{"detail": "Invalid refresh token: ..."}` or `{"detail": "Token provided is not a refresh token."}`

---

### 5. Forgot Password
`POST /api/v1/auth/forgot-password`

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "analyst@wastewise.ai"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "If an account with this email exists, password reset instructions have been sent."
  }
  ```
  *(Note: Always returns this generic 200 response to prevent email harvesting.)*

---

### 6. Reset Password
`POST /api/v1/auth/reset-password`

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "token": "d7fa8c3...",
    "new_password": "NewSecurePassword2026!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Password has been reset successfully. You can now log in with your new password."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{"detail": "Invalid or expired password reset token."}`
  - `400 Bad Request`: `{"detail": "This password reset token has already been used."}`
  - `400 Bad Request`: `{"detail": "This password reset token has expired."}`
  - `422 Unprocessable Content`: `{"detail": "Password must contain at least one special character..."}`

---

### 7. Logout
`POST /api/v1/auth/logout`

- **Headers**: `Authorization: Bearer <access_token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Successfully logged out."
  }
  ```

---

---

## 7. Admin → Route Management API

The Route module provides an enterprise foundation for managing collection routes, stops, progress metrics, vehicle/driver scheduling, and future AI/OR-Tools optimization.

All administrative route endpoints require the `ADMIN` role. Non-admin users (Collectors, Viewers) are rejected with `403 Forbidden`.

### Route REST API Contract

| HTTP Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/v1/admin/routes` | Paginated route listing with filters (`status`, `zone`, `vehicle_id`, `driver_id`, `scheduled_date`, `priority`), search, and sorting. |
| `POST` | `/api/v1/admin/routes` | Create a new route (validates vehicle/driver availability and conflicts for the date, auto-generates `RT-xxx` code). |
| `GET` | `/api/v1/admin/routes/summary` | Aggregate KPI counts (`total_routes`, `planned`, `in_progress`, `completed`, `at_risk`, `paused`, `cancelled`). |
| `GET` | `/api/v1/admin/routes/dashboard` | Composite dashboard payload (KPI summary, active routes, at-risk routes, today's routes, recent activity). |
| `GET` | `/api/v1/admin/routes/{route_id}` | Detailed route view with eager-loaded vehicle, driver, live metrics, and sequenced stops. Accepts integer ID or code (e.g. `RT-024`). |
| `PUT` | `/api/v1/admin/routes/{route_id}` | Update route details (re-validates vehicle/driver assignment availability if changed). |
| `PATCH` | `/api/v1/admin/routes/{route_id}/cancel` | Cancel route (`status = CANCELLED`). Completed routes cannot be cancelled. |
| `POST` | `/api/v1/admin/routes/{route_id}/start` | Start route execution (`status = IN_PROGRESS`). Allowed from `PLANNED` or `PAUSED`. |
| `POST` | `/api/v1/admin/routes/{route_id}/pause` | Pause active route (`status = PAUSED`). |
| `POST` | `/api/v1/admin/routes/{route_id}/resume` | Resume paused route (`status = IN_PROGRESS`). |
| `POST` | `/api/v1/admin/routes/{route_id}/complete` | Mark route completed. Validates that all stops are completed or skipped; provides `?force=true` override if needed. |
| `GET` | `/api/v1/admin/routes/{route_id}/stops` | List sequenced stops for the route ordered by `sequence_number ASC`. |
| `POST` | `/api/v1/admin/routes/{route_id}/stops` | Add a bin stop to the route with specified sequence number and priority. |
| `POST` | `/api/v1/admin/routes/{route_id}/stops/from-priority-bins` | Auto-select and append high fill-level / critical bins to the route. |
| `PATCH` | `/api/v1/admin/routes/{route_id}/stops/reorder` | Reorder all stops atomically using an ordered list of stop IDs. |
| `PATCH` | `/api/v1/admin/routes/{route_id}/stops/{stop_id}` | Update administrative stop properties (sequence, priority, notes). |
| `DELETE` | `/api/v1/admin/routes/{route_id}/stops/{stop_id}` | Remove stop and automatically re-sequence remaining stops. |
| `POST` | `/api/v1/admin/routes/{route_id}/stops/{stop_id}/complete` | Mark stop completed with collected weight (`actual_collected_weight_kg`), updating route load and progress. |
| `POST` | `/api/v1/admin/routes/{route_id}/stops/{stop_id}/skip` | Mark stop skipped with documented reason (preserves operational history). |
| `GET` | `/api/v1/admin/routes/{route_id}/progress` | Real-time status breakdown (`completed`, `pending`, `skipped`, `issues`, `completion_percentage`). |
| `GET` | `/api/v1/admin/routes/{route_id}/metrics` | Live metrics (`distance_km`, `estimated_duration_minutes`, `current_load_kg`, `vehicle_capacity_kg`, `capacity_utilization`). |
| `GET` | `/api/v1/admin/routes/{route_id}/map-data` | Minimal GPS payload for the map component (vehicle location and sequenced bin locations). |
| `GET` | `/api/v1/admin/routes/{route_id}/alerts` | Derived active route alerts (capacity overload, critical bin pending, delays). |
| `POST` | `/api/v1/admin/routes/{route_id}/optimization-preview` | Simulated preview placeholder ready for future OR-Tools engine integration. |

---

## 8. Running Tests

The test suite runs against the isolated `wastewise_test` database without affecting development data:

```bash
# Run all authentication and route management tests
python -m pytest tests/test_auth.py tests/test_routes.py -v
```

Covered test suites (35 tests total):
- User registration, login, logout, password reset, JWT validation
- Route CRUD, pagination, filtering, search, and sorting
- Route stops addition, removal, reordering, completion, and skipping
- Strict operational status state machines (`PLANNED` → `IN_PROGRESS` ⇄ `PAUSED` → `COMPLETED`)
- Driver role validation (`DRIVER`/`COLLECTOR` permitted; `ADMIN`/`VIEWER` blocked)
- Vehicle and driver scheduling conflict validation (409 Conflict)
- Backend progress and capacity utilization calculations
- Route completion validation against incomplete stops (with `force=true` support)
- Admin role authorization enforcement (`403 Forbidden` for non-admins)

