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
# Run all backend tests (Auth, Routes, Vehicles - 64 tests total)
python -m pytest tests/test_auth.py tests/test_routes.py tests/test_vehicles.py -v

# Run vehicle management tests specifically
python -m pytest tests/test_vehicles.py -v
```

Covered test suites (64 tests total):
- User registration, login, logout, password reset, JWT validation
- Route CRUD, pagination, filtering, search, and sorting
- Route stops addition, removal, reordering, completion, and skipping
- Strict operational status state machines (`PLANNED` → `IN_PROGRESS` ⇄ `PAUSED` → `COMPLETED`)
- Driver role validation (`DRIVER`/`COLLECTOR` permitted; `ADMIN`/`VIEWER` blocked)
- Vehicle and driver scheduling conflict validation (409 Conflict)
- Backend progress and capacity utilization calculations
- Vehicle CRUD, auto-generation of unique codes (`VEH-XXX`), duplicate checks
- Vehicle soft-deactivation (guarded against active routes) & reactivation
- Driver assignment & unassignment with role & conflict checks
- Vehicle operational status transitions (`AVAILABLE` → `ON_ROUTE`, etc.)
- Dynamic payload tracking & capacity utilization calculation
- GPS telemetry location updates and retrieval
- Maintenance record lifecycle (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`)
- Chronological audit logging (`VehicleActivity`)
- Fleet summary KPIs, capacity utilization distribution, and vehicles requiring attention
- Admin role authorization enforcement (`403 Forbidden` for non-admins)

---

## 9. Admin → Vehicle Management API Reference

All endpoints below require an `ADMIN` JWT bearer token in the `Authorization` header (`Bearer <token>`).

### 9.1 Summary & Dashboard Analytics

#### `GET /api/v1/admin/vehicles/dashboard`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/dashboard`
- **Authorization:** `ADMIN`
- **Query Parameters:** None
- **Request Body:** None
- **Success Response (200 OK):**
```json
{
  "summary": {
    "total": 13,
    "active": 13,
    "on_route": 6,
    "available": 4,
    "idle": 0,
    "maintenance": 2,
    "offline": 1,
    "inactive": 0
  },
  "utilization": {
    "total_capacity_kg": 13350.0,
    "current_load_kg": 6897.0,
    "utilization_percentage": 51.66,
    "vehicles_below_50_percent": 5,
    "vehicles_50_to_75_percent": 4,
    "vehicles_75_to_90_percent": 2,
    "vehicles_above_90_percent": 2
  },
  "attention_items": [
    {
      "vehicle_id": 27,
      "vehicle_code": "VEH-001",
      "type": "HIGH_LOAD",
      "severity": "warning",
      "message": "91.67% capacity - Near collection limit (1100.0kg / 1200.0kg)",
      "action_type": "view_vehicle",
      "target_id": "VEH-001"
    }
  ],
  "recent_activity": [...],
  "recent_vehicles": [...],
  "maintenance_overview": {
    "scheduled": 3,
    "in_progress": 1,
    "completed": 0,
    "overdue": 1
  }
}
```
- **Error Response:** `401 Unauthorized`, `403 Forbidden`

#### `GET /api/v1/admin/vehicles/summary`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/summary`
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** Fleet KPI counts (`total`, `active`, `on_route`, `available`, `idle`, `maintenance`, `offline`, `inactive`).

#### `GET /api/v1/admin/vehicles/utilization`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/utilization`
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** `total_capacity_kg`, `current_load_kg`, `utilization_percentage`, and bucket counts (`<50%`, `50-75%`, `75-90%`, `>90%`).

#### `GET /api/v1/admin/vehicles/attention`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/attention`
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** List of critical and warning items (e.g. `HIGH_LOAD`, `MAINTENANCE_OVERDUE`, `OFFLINE`, `ROUTE_ISSUE`).

---

### 9.2 Vehicle Fleet CRUD & Search

#### `GET /api/v1/admin/vehicles`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles`
- **Authorization:** `ADMIN`
- **Query Parameters:**
  - `page`: int (default `1`)
  - `page_size`: int (default `10`, max `100`)
  - `search`: string (matches vehicle code, name, registration number, driver name)
  - `status`: string (`AVAILABLE`, `ON_ROUTE`, `IDLE`, `MAINTENANCE`, `OFFLINE`, `INACTIVE`)
  - `vehicle_type`: string (`COMPACTOR`, `TIPPER`, `RECYCLING_TRUCK`, `MINI_COLLECTION`, `ELECTRIC_COLLECTION`)
  - `energy_type`: string (`DIESEL`, `CNG`, `ELECTRIC`, `HYBRID`)
  - `zone`: string
  - `driver_id`: int
  - `min_capacity`: float
  - `max_capacity`: float
  - `sort_by`: string (default `created_at`)
  - `sort_order`: string (`asc` / `desc`, default `desc`)
- **Success Response (200 OK):**
```json
{
  "items": [
    {
      "id": 27,
      "vehicle_code": "VEH-001",
      "name": "EcoCompactor 01",
      "vehicle_type": "COMPACTOR",
      "registration_number": "GJ-01-AB-1234",
      "capacity_kg": 1200.0,
      "current_load_kg": 1100.0,
      "capacity_utilization": 91.67,
      "energy_type": "CNG",
      "status": "ON_ROUTE",
      "zone": "NORTH",
      "is_active": true,
      "driver": {
        "id": 5,
        "name": "Arjun Patel",
        "email": "arjun.patel@wastewise.ai"
      },
      "current_route": {
        "id": 1,
        "route_code": "RT-001",
        "name": "Morning Commercial Loop",
        "status": "IN_PROGRESS"
      }
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 13,
  "pages": 2
}
```

#### `POST /api/v1/admin/vehicles`
- **Method:** `POST`
- **URL:** `/api/v1/admin/vehicles`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "name": "EcoCompactor 01",
  "vehicle_type": "COMPACTOR",
  "registration_number": "GJ-01-AB-1234",
  "capacity_kg": 1200,
  "energy_type": "CNG",
  "zone": "NORTH",
  "driver_id": null
}
```
- **Success Response (201 Created):** Full vehicle object with auto-generated `vehicle_code` (e.g. `VEH-001`), `status = "AVAILABLE"`, `current_load_kg = 0.0`.
- **Error Responses:** `400 Bad Request` (invalid capacity/driver), `409 Conflict` (duplicate registration number).

#### `GET /api/v1/admin/vehicles/{vehicle_id}`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}` (accepts integer ID or string `vehicle_code` like `VEH-001`)
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** Detailed vehicle object including `driver`, `current_route`, `recent_maintenance`, and `recent_activities`.
- **Error Response:** `404 Not Found`.

#### `PUT /api/v1/admin/vehicles/{vehicle_id}`
- **Method:** `PUT`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "name": "EcoCompactor 01 Updated",
  "vehicle_type": "COMPACTOR",
  "registration_number": "GJ-01-AB-9999",
  "capacity_kg": 1400,
  "energy_type": "CNG",
  "zone": "NORTH"
}
```
- **Validation:** New capacity cannot be lower than current load.
- **Success Response (200 OK):** Updated vehicle object.
- **Error Response:** `400 Bad Request`, `404 Not Found`, `409 Conflict`.

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/deactivate`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/deactivate`
- **Authorization:** `ADMIN`
- **Guard:** Cannot deactivate vehicle if assigned to an active route (`PLANNED`, `IN_PROGRESS`, `PAUSED`, `AT_RISK`).
- **Success Response (200 OK):** `{"message": "Vehicle VEH-001 deactivated successfully."}`
- **Error Response:** `409 Conflict`.

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/activate`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/activate`
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** Sets `is_active = true`, `status = "AVAILABLE"`.

---

### 9.3 Operations, Driver & Telemetry

#### `POST /api/v1/admin/vehicles/{vehicle_id}/assign-driver`
- **Method:** `POST`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/assign-driver`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "driver_id": 5
}
```
- **Validation:** User must exist, be active, have role `DRIVER` or `COLLECTOR`, and not be currently assigned to another active vehicle.
- **Success Response (200 OK):** Updated vehicle object with assigned driver.
- **Error Response:** `400 Bad Request` (invalid role/inactive), `404 Not Found`, `409 Conflict` (driver already assigned).

#### `DELETE /api/v1/admin/vehicles/{vehicle_id}/driver`
- **Method:** `DELETE`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/driver`
- **Authorization:** `ADMIN`
- **Guard:** Blocked if vehicle is currently executing an active route.
- **Success Response (200 OK):** `{"message": "Driver removed from vehicle VEH-001 successfully."}`

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/status`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/status`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "status": "ON_ROUTE"
}
```
- **Validation:** Enforces valid lifecycle transitions; prevents transitioning inactive vehicles or moving vehicles with active routes to `MAINTENANCE` without completing/cancelling the route.
- **Success Response (200 OK):** Updated vehicle object.

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/load`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/load`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "current_load_kg": 780
}
```
- **Validation:** `0 <= current_load_kg <= capacity_kg`. Backend calculates `capacity_utilization`.
- **Success Response (200 OK):**
```json
{
  "vehicle_id": 27,
  "vehicle_code": "VEH-001",
  "current_load_kg": 780.0,
  "capacity_kg": 1200.0,
  "capacity_utilization": 65.0
}
```

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/location`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/location`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "latitude": 23.0300,
  "longitude": 72.5800
}
```
- **Success Response (200 OK):** Returns telemetry payload with updated timestamp.

#### `GET /api/v1/admin/vehicles/{vehicle_id}/location`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/location`
- **Authorization:** `ADMIN`
- **Success Response (200 OK):** `{"vehicle_id": 27, "latitude": 23.0300, "longitude": 72.5800, "last_updated": "..."}`. Returns `null` coordinates if no location has been recorded.

---

### 9.4 Maintenance & Audit Trail

#### `POST /api/v1/admin/vehicles/{vehicle_id}/maintenance`
- **Method:** `POST`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/maintenance`
- **Authorization:** `ADMIN`
- **Request Body:**
```json
{
  "service_type": "Routine Service",
  "service_date": "2026-09-20",
  "next_service_date": "2026-10-20",
  "odometer_km": 18420,
  "status": "SCHEDULED",
  "notes": "Oil and filter inspection"
}
```
- **Success Response (201 Created):** Created `VehicleMaintenanceRecord`. Setting status to `IN_PROGRESS` automatically moves vehicle status to `MAINTENANCE`.

#### `GET /api/v1/admin/vehicles/{vehicle_id}/maintenance`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/maintenance`
- **Query Parameters:** `page`, `page_size`, `status` (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`, `CANCELLED`).
- **Success Response (200 OK):** Paginated records ordered by `service_date DESC`.

#### `PATCH /api/v1/admin/vehicles/{vehicle_id}/maintenance/{maintenance_id}`
- **Method:** `PATCH`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/maintenance/{maintenance_id}`
- **Success Response (200 OK):** Updated record. Marking record `COMPLETED` restores vehicle from `MAINTENANCE` to `AVAILABLE`.

#### `GET /api/v1/admin/vehicles/{vehicle_id}/history`
- **Method:** `GET`
- **URL:** `/api/v1/admin/vehicles/{vehicle_id}/history`
- **Query Parameters:** `limit` (default `50`)
- **Success Response (200 OK):** Chronological audit trail records (`activity_type`, `description`, `created_at`).

---

## 10. Admin → Bin Management API Reference

All endpoints below are under `/api/v1/admin/bins` and require an `ADMIN` JWT bearer token in the `Authorization` header (`Bearer <token>`). Non-admins receive `403 Forbidden`.

### 10.1 Network Summaries & Operational Intelligence

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/bins/summary` | Fleet-wide bin summary: total/active/inactive, status counts, collection needs, priority counts, avg fill, avg battery, online sensor %, predicted overflow count. |
| `GET` | `/api/v1/admin/bins/network-health` | Network health KPIs: online/offline/degraded sensors, health %, average battery, telemetry freshness string, stale bins, critical bins. |
| `GET` | `/api/v1/admin/bins/map` | Lightweight map markers (coordinates, status, fill %, priority, zone, waste type, predicted overflow). Accepts `zone`, `status`, `priority`, `waste_type`, `is_active` filters. |
| `GET` | `/api/v1/admin/bins/analytics` | High-level bin aggregates (average/min/max fill, collection count, overflow events, critical events, waste type distribution, zone distribution). |
| `GET` | `/api/v1/admin/bins/collection-summary` | Collection state breakdown counts (`NOT_REQUIRED`, `SCHEDULED`, `PRIORITY`, `OVERDUE`, `IN_PROGRESS`, `COLLECTED`), lists of priority & overdue bins, and bins due today. |

### 10.2 Bin CRUD & Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/bins` | Paginated bin listing with multidimensional filtering (`status`, `zone`, `waste_type`, `collection_status`, `priority`, `bin_type`, `connectivity_status`, `is_active`, `fill_min`, `fill_max`, `fill_level`), search (`bin_code`, `name`, `address`, `sensor_id`), sorting (`sort_by`, `sort_order`). |
| `POST` | `/api/v1/admin/bins` | Create bin with auto-generated code (`BIN-XXXX`) or custom code. Validates capacities (`0 < capacity_kg`), initial fill, and uniqueness. Records `CREATED` audit event. |
| `GET` | `/api/v1/admin/bins/{bin_id}` | Comprehensive bin details drawer data: basic info, location, status, fill, sensor, collection info, prediction info, active route assignment, recent telemetry (10), recent collections (5), recent activities (15), and health summary. |
| `PATCH` | `/api/v1/admin/bins/{bin_id}` | Update bin fields (`name`, `bin_type`, `capacity_kg`, `waste_type`, `zone`, `address`, `latitude`, `longitude`, `status`, `collection_status`, `priority`, `next_collection_at`). Records `UPDATED` audit event. |

### 10.3 Operational Lifecycle & Bulk Actions

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/v1/admin/bins/{bin_id}/activate` | Restores inactive bin to `NORMAL` status and `is_active = true`. |
| `PATCH` | `/api/v1/admin/bins/{bin_id}/deactivate` | Soft-deactivates bin (`is_active = false`, `status = INACTIVE`). Guarded against bins currently in an active route (`409 Conflict`). |
| `PATCH` | `/api/v1/admin/bins/{bin_id}/status` | Transition operational status (`NORMAL`, `WARNING`, `CRITICAL`, `OFFLINE`, `MAINTENANCE`, `INACTIVE`) with state machine validation. |
| `PATCH` | `/api/v1/admin/bins/{bin_id}/priority` | Update collection priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with source (`MANUAL`, `SYSTEM`, `PREDICTION`) and reason. |
| `POST` | `/api/v1/admin/bins/{bin_id}/prioritize` | Flags bin for immediate collection (`priority = CRITICAL`, `collection_status = PRIORITY`). |
| `POST` | `/api/v1/admin/bins/bulk-action` | Batch operations (`ACTIVATE`, `DEACTIVATE`, `SET_PRIORITY`, `SET_STATUS`, `SET_COLLECTION_STATUS`) on list of `bin_ids`. Returns success/failure IDs with detailed error explanations. |

### 10.4 Sensor Management & Telemetry Ingestion

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/bins/{bin_id}/sensor` | Retrieve primary active sensor details for bin. |
| `POST` | `/api/v1/admin/bins/{bin_id}/sensor` | Attach/pair a hardware sensor (`sensor_id`, `sensor_type`, `battery_percentage`, `firmware_version`). Enforces uniqueness. |
| `PATCH` | `/api/v1/admin/bins/{bin_id}/sensor` | Update sensor hardware status, battery, firmware, or connectivity. |
| `DELETE` | `/api/v1/admin/bins/{bin_id}/sensor` | Unpair/detach sensor from bin. |
| `POST` | `/api/v1/admin/bins/{bin_id}/telemetry` | Ingest IoT sensor reading (`fill_percentage`, `fill_kg`, `battery_percentage`, `temperature_celsius`, `source`). Atomically records historical log, updates current bin fill/battery/connectivity, evaluates status thresholds (`>=90%` -> `CRITICAL`, `>=75%` -> `WARNING`, `<75%` -> `NORMAL`), and triggers audit event on status transition. |
| `GET` | `/api/v1/admin/bins/{bin_id}/telemetry` | Historical sensor readings with date filtering (`from_date`, `to_date`) and limit. |
| `GET` | `/api/v1/admin/bins/{bin_id}/collections` | Historical collection log with collector, vehicle, collected weight, and notes. |
| `GET` | `/api/v1/admin/bins/{bin_id}/activity` | Audit log for bin lifecycle events. |


