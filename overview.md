# Wanderers – Tour Package Management & Marketplace System

## 📌 Project Overview

**Wanderers** is a modern, full-stack B2B2C travel marketplace built for connecting adventure seekers with verified tour companies. The platform adheres strictly to the core business rule: **The platform itself NEVER creates tour packages; only verified tour companies (operators) can create and publish packages.**

The application is built as a clean monorepo containing a high-performance Express/Node.js backend paired with a modern React + Vite frontend.

---

## 🏗️ Architecture & Technology Stack

### Backend Stack (`/server`)
- **Runtime & Language:** Node.js (v18+) with TypeScript (`tsx` for dev runtime execution)
- **Web Framework:** Express.js
- **Database & ORM:** SQLite (`dev.db`) managed via **Prisma ORM (v5)**
- **Authentication:** JWT (JSON Web Tokens) with `bcrypt` password hashing
- **Security & Performance:** `cors`, `helmet`, `compression`, `express-rate-limit`, `morgan` logging

### Frontend Stack (`/client`)
- **Framework & Tooling:** React 18 + Vite + TypeScript
- **Styling & UI:** Tailwind CSS (v3) with standard HSL theme extension & Lucide Icons
- **State & Data Fetching:** TanStack React Query (`@tanstack/react-query`) + Axios API Client
- **Animations:** Framer Motion for modern, glassmorphic micro-animations and transitions

---

## 🚀 Features Implemented Till Now

### 1. Monorepo Workspace Setup
- Root `package.json` setup with npm workspaces for managing `client/` and `server/`.
- Automated server management setup with `tsx` to support Node v24 compatibility.
- Zero-config local SQLite database setup for instant local execution.

---

### 2. Backend API Architecture

#### 🔑 Authentication Module (`/api/auth`)
- `POST /api/auth/signup`: User registration with role selection (`TOURIST` or `OPERATOR`). Passwords hashed securely with `bcrypt`.
- `POST /api/auth/login`: User login returning signed JWT access tokens and user profile information.

#### 🏢 Company / Tour Operator Module (`/api/companies`)
- `POST /api/companies`: Enables `OPERATOR` users to register their company details (Name, Description, GST Number, License URL).
- `GET /api/companies/me`: Returns the authenticated operator's registered company details.
- `GET /api/companies/:id`: Public endpoint for viewing company profiles and verification status.

#### 📦 Tour Package Module (`/api/packages`)
- `GET /api/packages`: Public endpoint returning all published packages along with the verified company name.
- `GET /api/packages/:id`: Detailed view of a single package including reviews and operator info.
- `POST /api/packages`: Restricted to `OPERATOR` users. Publishes a package attached specifically to their verified company ID.
- `PUT /api/packages/:id` & `DELETE /api/packages/:id`: Protected routes allowing companies to update or delete their owned tour packages.

#### 🎟️ Booking Management (`/api/bookings`)
- `POST /api/bookings`: Allows `TOURIST` users to book a package with travel date and passenger counts.
- `GET /api/bookings/my-bookings`: Fetches all bookings made by the authenticated user.
- `PATCH /api/bookings/:id/status`: Allows companies to confirm, reject, or complete bookings.

---

### 3. Frontend Web Application

#### 🎨 Premium Aesthetics & Theme System
- **Dark / Light Mode Support:** Complete theme switching integrated directly into the persistent Navbar.
- **Glassmorphism & Micro-animations:** Built with Framer Motion for hero banners, search cards, and package listings.

#### 🧱 Key UI Pages & Components
- **Navbar (`Navbar.tsx`):**
  - Brand identity logo.
  - Interactive navigation links (`Home`, `Packages`, `About`).
  - Search input field.
  - Dark mode toggle button & Login action trigger.

- **Landing Home Page (`Home.tsx`):**
  - High-impact hero section with typography and visual call-to-action buttons.
  - Search & filter card to search destinations, budget ranges, and trip durations.
  - Features highlight grid (Verified Operators, Handpicked Packages, Best Price Guarantee).
  - Trending destinations preview cards with animated hover states.

- **Tour Packages Page (`Packages.tsx`):**
  - Connected live to `/api/packages` using **React Query**.
  - Dynamic loading state with animated spinner.
  - Empty state fallback UI ("No packages yet!") when the database has no published packages.
  - Responsive package card grid displaying price tags, duration badges, ratings, and destination details.

- **Authentication Modal / Page (`Login.tsx`):**
  - Dual-tab toggle for **Tourist** and **Tour Operator** login modes.
  - Glassmorphic card layout with form validation and modern input styling.

---

## 🔄 Data & Workflow Execution Flow

```
[ Tourist / Guest ] ──> Browses Homepage & Packages (React UI)
                              │
                              ▼
                  [ React Query + Axios ]
                              │
                              ▼ (HTTP GET /api/packages)
                    [ Express API Server ]
                              │
                              ▼ (Prisma Client)
                    [ SQLite DB (dev.db) ]
```

```
[ Tour Operator ] ──> Login/Register ──> Register Company ──> Publish Tour Package
                                                                    │
                                                                    ▼
                                                            Belongs to Company
```

---

## 🛠️ How to Run the Project Locally

### 1. Backend Server
```bash
cd server
npm run dev
```
*Backend runs at http://localhost:3001 with health check endpoint at http://localhost:3001/health*

### 2. Frontend Client
```bash
cd client
npm run dev
```
*Frontend runs at http://localhost:5173*
