# Wanderers – Enterprise Frontend Architecture & Design System Specification (Session 6)

**Role:** Chief Frontend Architect, Senior UI/UX Designer & Design Systems Architect  
**Document Type:** Production-Ready Frontend Architecture, Component System & UI Specification  
**Baseline:** Extends Baseline Architecture v1.0, Session 2 Features, Session 3 UX, Session 4 Database & Session 5 Backend Specs  

---

# Phase 1 – Frontend Architecture & Engineering Strategy

### 1.1 Architectural Pattern: Component-Driven Atomic Architecture

Wanderers implements a **Component-Driven Atomic Architecture** paired with a **Feature-Based Module Strategy**. Components are strictly categorized into:
1. **Atoms:** Base primitives (Buttons, Inputs, Badges, Icons).
2. **Molecules:** Composite UI elements (Search Bars, User Avatars with Status Pills, Star Rating Badges).
3. **Organisms:** Complex self-contained features (Package Cards, Navigation Bar, Booking Modal, Incoming Bookings Table).
4. **Templates / Layouts:** Reusable page wrappers (`DashboardLayout`, `PublicLayout`).

```
[ REACT 18 SPA FRONTEND LAYER ]
  │
  ├── [ STATE MANAGEMENT LAYER ]
  │     ├── Server State (React Query v5 - Async API Caching)
  │     ├── Local UI State (React useState / useReducer)
  │     └── Global Session State (React Context / LocalStorage)
  │
  ├── [ DESIGN SYSTEM LAYER ]
  │     ├── Tailwind CSS v3 Utility Engine
  │     ├── Framer Motion Spring Animation System
  │     └── Lucide Iconography Library
  │
  └── [ ROUTING & GUARD LAYER ]
        ├── React Router v6 Hash / Browser Router
        └── Role-Based Route Guards (`RequireAuth`, `RequireRole`)
```

### 1.2 Architectural Rationale
- **React Query for Server State:** Eliminates redundant Redux boilerplate by handling data fetching, background revalidation, and caching automatically.
- **Tailwind CSS v3 for Design System Tokens:** Guarantees zero runtime CSS overhead while providing atomic utility control.
- **Framer Motion for Micro-Interactions:** Elevates visual perception to Stripe/Airbnb quality through spring-physics transitions.

---

# Phase 2 – Production Project Directory Structure

```
client/
├── src/
│   ├── api/                # Axios instance, endpoints (apiClient.ts, packageApi.ts, bookingApi.ts)
│   ├── assets/             # Static SVGs, images, brand logos
│   ├── components/         # Reusable atomic UI components
│   │   ├── Navbar.tsx      # Backdrop-blur role-aware header
│   │   ├── Footer.tsx      # Hierarchical sitemap footer
│   │   ├── Reviews.tsx     # Review stars & buyer comments
│   │   └── ChatModal.tsx   # Tourist-Operator messaging modal
│   ├── pages/              # View components matching routes
│   │   ├── Home.tsx        # Hero landing page
│   │   ├── Packages.tsx    # Marketplace discovery grid & search filters
│   │   ├── Login.tsx       # Auth portal with role toggle
│   │   ├── OperatorDashboard.tsx # Operator revenue analytics & bookings table
│   │   ├── TouristProfile.tsx # Tourist travel vouchers & bookings history
│   │   ├── AdminDashboard.tsx    # Governance queue & operator verification
│   │   └── HelpCenter.tsx        # Searchable FAQs & support ticket form
│   ├── App.tsx             # Main routing registry & React Query provider
│   ├── index.css           # Global Tailwind directives & custom CSS tokens
│   └── main.tsx            # React 18 DOM mount point
```

---

# Phase 3 – Design System & Visual Token Palette

### 3.1 HSL Color Tokens

| Token Name | HSL Value | Hex Code | Visual Application |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `hsl(221.2, 83.2%, 53.3%)` | `#2563eb` | Primary CTA buttons, brand badges, active tab indicators. |
| `--color-emerald` | `hsl(142.1, 76.2%, 36.3%)` | `#059669` | `Verified Operator` status pills, `CONFIRMED` booking badges. |
| `--color-amber` | `hsl(37.7, 92.1%, 50.2%)` | `#d97706` | `Pending Review` alerts, `PENDING` booking status pills. |
| `--color-slate-900`| `hsl(222.2, 84%, 4.9%)` | `#0f172a` | Dark mode background, primary dark text headers. |

### 3.2 Typography Tokens
- **Primary Font Family:** `Inter, system-ui, -apple-system, sans-serif`.
- **Monospace Font Family:** `JetBrains Mono, monospace` (used for Booking Reference IDs e.g. `#WND-104`).
- **Hierarchy:**
  - Display 1: `3.75rem` (`60px`), `font-weight: 800`, `leading: 1.1`.
  - Heading 1: `2.25rem` (`36px`), `font-weight: 700`.
  - Body Regular: `0.875rem` (`14px`), `font-weight: 400`.
  - Caption: `0.75rem` (`12px`), `font-weight: 500`.

---

# Phase 4 – Component Library & Interface Specs

### 4.1 Tour Package Card (`Organism`)
- **Purpose:** Primary grid item presenting cover image, operator verification badge, destination tag, price per person, and action buttons.
- **States:** Hover scale-up (`scale: 1.02`), Loading skeleton pulse, Active wishlist heart.
- **Accessibility:** `aria-label="Tour package: Swiss Alps Hiking, $1200"`.

### 4.2 Booking Pass Voucher Modal (`Organism`)
- **Purpose:** Interactive modal displaying confirmed booking details, traveler rosters, and print controls.
- **Accessibility:** Focus trap inside modal; `Escape` key closes overlay.

---

# Phase 5 – Animation Principles & Framer Motion Guidelines

1. **Page Entrance:** Fade-in + Y-slide (`initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}`).
2. **Button Hover:** Scale transform (`whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}`).
3. **Backdrop Blur Modal:** Overlay transition (`initial={{ opacity: 0 }} animate={{ opacity: 1 }}`).

---

# Phase 6 – Accessibility (WCAG 2.1 AA) & Performance Strategy

1. **WCAG Compliance:** All text-to-background contrast ratios exceed 4.5:1. Interactive input elements contain explicit focus rings (`focus:ring-2 focus:ring-blue-500`).
2. **Code Splitting & Bundle Optimization:** Page components lazy loaded using `React.lazy()` + Vite chunking.
