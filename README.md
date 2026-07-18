<div align="center">
  <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=120&h=120" alt="Wanderers Logo" style="border-radius: 50%;">
  <h1>Wanderers – Tour Package Management System</h1>
  
  <p>A production-ready, full-stack web application for curating, booking, and managing travel experiences.</p>

  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

## 🌟 Features

* **Beautiful UI:** A visually stunning frontend utilizing Tailwind CSS, modern typography, glassmorphism, and responsive layouts.
* **Tour Browsing & Booking:** Dynamic loading of curated tour destinations with a seamless booking interface.
* **Full CRUD Admin Dashboard:** A robust management panel protected by JWT authentication to manage bookings (approve/reject/delete) and packages.
* **Production-Ready Security:** Protected against brute-force attacks via rate limiting, protected against XSS and Injection attacks via rigorous validation and parameterization, and fortified with secure HTTP headers.
* **Modular MVC Architecture:** Clean separation of concerns with dedicated Routes, Controllers/Middlewares, and Database configuration.

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla CSS, JavaScript, Tailwind CSS (via CDN)
* **Backend:** Node.js, Express.js
* **Database:** SQLite3 (Fully Normalized Schema with Strict Foreign Key Constraints)
* **Security & Performance:** `helmet`, `express-rate-limit`, `express-validator`, `bcrypt`, `jsonwebtoken`, `compression`

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or higher)

### Installation & Setup

1. **Clone and Navigate to the project directory:**
   ```bash
   git clone <your-repo-url>
   cd Wanderers
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the example environment file and add your own secrets:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you update the `JWT_SECRET` and Admin credentials in `.env` before deploying.*

4. **Initialize the database:**
   This will create the `wanderers.db` file and populate it with the strict schema and initial seed data.
   ```bash
   npm run setup
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **View in Browser:**
   Open your browser and navigate to `http://localhost:3000`. Access the Admin panel via `/admin-login.html`.

## 📁 Project Structure

```text
Wanderers/
├── config/
│   └── db.js                 # Database connection & PRAGMA configuration
├── middleware/
│   ├── auth.js               # JWT authentication logic
│   └── validators.js         # Input sanitization and validation rules
├── routes/
│   ├── admin.js              # Admin Auth and CRUD endpoints
│   ├── bookings.js           # Public booking creation endpoints
│   └── packages.js           # Public package viewing endpoints
├── public/                   # Static frontend assets (HTML, CSS, JS)
├── server.js                 # Express entry point, global middlewares, error handling
├── setup_db.js               # Database schema initialization script
└── .env                      # Environment variables (not committed)
```

## 🔌 API Endpoints Summary

### Public
- `GET /api/packages` - Fetch all available packages
- `GET /api/packages/:id` - Fetch a specific package
- `POST /api/bookings` - Submit a new booking (Validates email, dates, pax)

### Admin (Protected by JWT)
- `POST /api/admin/login` - Authenticate admin (Strict Rate Limit: 5 req/15m)
- `GET /api/admin/bookings` - View all bookings with relational package/user data
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `POST /api/admin/packages` - Add a new tour package
- `PUT /api/admin/packages/:id` - Edit a package
- `DELETE /api/admin/packages/:id` - Delete a package

## 📝 DBMS Normalization & Integrity
The database utilizes relational concepts to ensure strict data integrity:
- **`users` Table:** Stores unique user profiles (Email is UNIQUE).
- **`packages` Table:** Stores tour details (Destination, Price, Duration).
- **`bookings` Table:** A junction table connecting Users and Packages. It uses `FOREIGN KEY` constraints with `ON DELETE CASCADE` to ensure no orphaned records ever exist.

---
*Developed for the Wanderers Tour Package Management System project.*
