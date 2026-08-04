# Wanderers – Enterprise Backend Software Architecture & API Specification (Session 5)

**Role:** Chief Software Architect, Principal API Architect & Cloud Solutions Architect  
**Document Type:** Production-Ready Enterprise Backend System Design & API Blueprint  
**Baseline:** Extends Architecture v1.0, Session 2 Feature Breakdown, Session 3 UX Specs & Session 4 Data Model  

---

# Phase 1 – System Architecture & Architectural Principles

### 1.1 Architectural Pattern: Layered Modular Monolith

Wanderers utilizes a **Layered Modular Monolith** pattern. This structure ensures strict separation of concerns, high internal cohesion, and low inter-module coupling, enabling seamless extraction into independent microservices as transaction volume scales.

```
┌────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                │
│               React 18 SPA / Mobile App / Third-Party REST             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP / JSON (Bearer JWT)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          API GATEWAY / ROUTER                          │
│                  Helmet / CORS / Rate Limiter / Express                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                         MIDDLEWARE PIPELINE                            │
│         Authenticate (JWT) ──> Authorize (RBAC) ──> Validate (Zod)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                           CONTROLLER LAYER                             │
│               HTTP Request Extraction & DTO Response Mapping           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                            SERVICE LAYER                               │
│             Domain Business Logic & Multi-Module Orchestration          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          REPOSITORY LAYER                              │
│                Data Access Abstraction (Prisma ORM)                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                           PERSISTENCE LAYER                            │
│               PostgreSQL / SQLite Database Engine + Redis              │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Layer Responsibility Matrix
- **Controller Layer:** Parses HTTP inputs, extracts headers/cookies, calls Service functions, and maps responses to standard JSON structures. Contains zero business logic.
- **Service Layer:** Houses pure domain logic, enforces business rules, manages transactional boundaries, and dispatches background queue events.
- **Repository Layer:** Encapsulates raw database queries via Prisma ORM, abstracting data persistence mechanisms from higher layers.
- **Middleware Layer:** Intercepts incoming requests to validate JWT claims, enforce role permissions, sanitize inputs, and log request telemetry.

---

# Phase 2 – Production Project Directory Architecture

```
server/
├── config/                 # Environment variables, database & Redis connection singletons
├── src/
│   ├── controllers/        # Request handlers (Auth, Package, Booking, Company, Admin)
│   ├── services/           # Core domain business logic services
│   ├── repositories/       # Prisma query abstraction classes
│   ├── middlewares/        # Authentication, Authorization, ErrorHandler, RateLimiter
│   ├── routes/             # Express API route declarations
│   ├── dto/                # Data Transfer Objects & validation contracts
│   ├── interfaces/         # TypeScript types & custom interface definitions
│   ├── jobs/               # Async background queue workers (BullMQ)
│   ├── utils/              # JWT helpers, Logger (Winston), Password Hashers
│   ├── constants/          # Error codes, Role enums, Status constants
│   └── index.ts            # Server entry point & Express bootstrap
├── prisma/
│   ├── schema.prisma       # Master database schema
│   └── dev.db              # Local SQLite database file
└── tests/                  # Integration & unit test suites (Jest / Supertest)
```

---

# Phase 3 – Core Module Architecture

| Module Name | Core Responsibility | Primary Dependencies | Security Level |
| :--- | :--- | :--- | :--- |
| **Auth Module** | JWT issuance, password hashing, Google SSO, token refresh | `bcrypt`, `jsonwebtoken` | Critical |
| **Operator Module** | Verification documents, GST validation, agency profile | `AuthService`, S3 Upload | High |
| **Package Module** | Tour package inventory, day-by-day itineraries, pricing | `CompanyService` | Public / High |
| **Booking Module** | Seat reservation, past-date guards, passenger rosters | `PackageService`, `AuthService` | High |
| **Payment Module** | Gateway webhooks, escrow holding, tax invoice split | Stripe / Razorpay API | Critical |
| **Admin Module** | Platform governance, verification review, audit logs | All Services | Highest (Admin Only) |

---

# Phase 4 – Master REST API Specification

### 4.1 Authentication & Profile APIs

| Endpoint | Method | Role Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public (`GUEST`) | Registers new user (`TOURIST` or `OPERATOR`). Validates unique email and bcrypt hashing. |
| `/api/auth/login` | `POST` | Public (`GUEST`) | Verifies credentials, returns 7-day JWT token and user profile object. |
| `/api/auth/me` | `GET` | Authenticated | Fetches current user profile and role claims from JWT token. |

### 4.2 Package Management APIs

| Endpoint | Method | Role Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `/api/packages` | `GET` | Public (`GUEST`) | Returns list of tour packages. Supports `destination` and `maxPrice` query parameters. |
| `/api/packages` | `POST` | Verified Operator | Publishes a new tour package. Requires Title, Price (> 0), Duration, and Itinerary. |
| `/api/packages/:id` | `PUT` | Verified Operator | Updates an existing tour package owned by operator. |
| `/api/packages/:id` | `DELETE` | Verified Operator | Deletes a tour package listing without invalidating active past bookings. |

### 4.3 Booking & Operations APIs

| Endpoint | Method | Role Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `/api/bookings` | `POST` | Tourist / Operator | Places a booking. Enforces `travelDate >= Today` and `passengers >= 1`. |
| `/api/bookings/me` | `GET` | Tourist | Retrieves all bookings placed by current logged-in tourist. |
| `/api/bookings/company`| `GET` | Operator | Retrieves all incoming bookings placed for operator's tour packages. |
| `/api/bookings/:id/status`| `PATCH` | Operator | Updates booking state (`CONFIRMED`, `REJECTED`, `COMPLETED`). |

### 4.4 Admin & Governance APIs

| Endpoint | Method | Role Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `/api/companies` | `GET` | Admin | Fetches list of all registered tour companies and verification statuses. |
| `/api/companies/:id/verify`| `PATCH` | Admin | Toggles `isVerified` status of a tour company (`true` / `false`). |

---

# Phase 5 – Role-Based Access Control (RBAC) Authorization Matrix

| API Route | Guest Visitor | Tourist | Operator | Admin |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/login` | Allowed | Allowed | Allowed | Allowed |
| `GET /api/packages` | Allowed | Allowed | Allowed | Allowed |
| `POST /api/packages` | Denied | Denied | Allowed (Verified) | Allowed |
| `POST /api/bookings` | Denied | Allowed | Allowed | Allowed |
| `GET /api/bookings/company` | Denied | Denied | Allowed | Allowed |
| `PATCH /api/companies/:id/verify`| Denied | Denied | Denied | Allowed |

---

# Phase 6 – Centralized Error Handling Architecture

All API exceptions are intercepted by a centralized Express error middleware returning standard JSON responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE",
    "message": "Selected travel date must be today or in the future.",
    "status": 400,
    "timestamp": "2026-08-04T13:30:00Z"
  }
}
```

---

# Phase 7 – Security & Microservice Evolution Strategy

1. **Security Protections:** Rate limiting via `express-rate-limit` (100 requests per 15 mins per IP), Helmet HTTP header sanitization, CORS domain whitelisting, and parameter pollution protection.
2. **Microservice Migration Roadmap:** As transaction volumes exceed 1M/month, the modular monolith easily splits into decoupled microservices:
   - **Auth Service:** Port 3001
   - **Package Catalog Service:** Port 3002
   - **Booking & Reservations Service:** Port 3003
   - **Payment & Escrow Service:** Port 3004
