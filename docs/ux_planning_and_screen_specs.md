# Wanderers – Complete UX Architecture, Screen Specifications & Information Architecture (Session 3)

**Role:** Senior UX Architect, Product Designer & Solution Architect  
**Document Type:** Production-Ready UI/UX & Information Architecture Specification  
**Baseline:** Extends Existing Core Architecture v1.0 & Session 2 Feature Breakdown  

---

# Phase 1 – Information Architecture (IA)

### 1.1 Hierarchical Site Map & Taxonomy

```
[ WANDERERS IA ]
  │
  ├── [ PUBLIC AREA ]
  │     ├── Landing Home (`/`)
  │     ├── Package Explorer (`/packages`)
  │     ├── Package Details (`/packages/:id`)
  │     ├── Operator Public Profile (`/company/:id`)
  │     ├── About Us (`/about`)
  │     ├── Help Center & FAQ (`/help`)
  │     └── Legal (`/terms`, `/privacy`)
  │
  ├── [ AUTHENTICATION AREA ]
  │     ├── Login (`/login`)
  │     ├── Sign Up / Role Selection (`/login?mode=signup`)
  │     ├── Forgot Password (`/forgot-password`)
  │     └── Reset Password (`/reset-password`)
  │
  ├── [ TOURIST DASHBOARD ]
  │     ├── My Profile (`/profile`)
  │     ├── My Bookings (`/profile/bookings`)
  │     ├── Wishlist (`/profile/wishlist`)
  │     └── Settings (`/profile/settings`)
  │
  ├── [ OPERATOR DASHBOARD ]
  │     ├── Agency Overview (`/operator`)
  │     ├── Company Verification Setup (`/operator/verification`)
  │     ├── Package Builder / Inventory (`/operator/packages`)
  │     └── Customer Bookings (`/operator/bookings`)
  │
  └── [ ADMIN CONTROL TOWER ]
        ├── Verification Approval Queue (`/admin`)
        ├── User & Company Directory (`/admin/directory`)
        └── Platform Revenue Metrics (`/admin/analytics`)
```

### 1.2 Navigation Group Rationale
- **Public Area:** Zero-friction discovery engine designed to convert search traffic into registered bookings.
- **Authentication Area:** Unified portal with clear role-segregation pills (`Tourist` vs `Tour Operator`).
- **Tourist Area:** Focuses on travel preparation, active booking vouchers, and wishlist bookmarking.
- **Operator Area:** Commercial cockpit for inventory publication, pricing, and incoming passenger manifest management.
- **Admin Area:** Compliance control tower for company verification, fraud prevention, and marketplace monitoring.

---

# Phase 2 – Application Navigation Structure

### 2.1 Cross-Device Layout Strategy

| Device Tier | Primary Navigation | Secondary Navigation | Action Triggers |
| :--- | :--- | :--- | :--- |
| **Desktop (>= 1024px)** | Top Sticky Blur Header (`Navbar.tsx`) | Role-based links in Header (Home, Packages, Dashboard) | Primary CTA Pill (`Sign In` or `Hi, User` Avatar) |
| **Tablet (768px - 1023px)** | Top Compact Header | Expandable Hamburger Menu Drawer | Quick Search Bar & Cart/Wishlist Badge |
| **Mobile (< 768px)** | Top Logo Bar + Sticky Bottom Nav | 4-Tab Bottom Dock (Home, Packages, Bookings, Profile) | Floating Action Button (`+ Add Package` for Operators) |

### 2.2 Navigation Components
- **Top Navigation Bar:** Backdrop-blur glassmorphic header containing brand logo, contextual role links, search input, and profile/logout controls.
- **Breadcrumb System:** Formatted as `Home > Packages > Interlaken > Swiss Alps Hiking` to allow instant back-navigation.
- **Deep Linking:** URLs like `/packages?destination=Switzerland&maxPrice=2500` preserve search filters directly in the address bar for shareability.

---

# Phase 3 – Complete Screen Inventory

| Screen ID | Screen Name | Access Level | Navigation Path | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-01** | Landing Home | Public (`GUEST`) | `/` | MVP |
| **SCR-02** | Package Explorer | Public (`GUEST`) | `/packages` | MVP |
| **SCR-03** | Package Details Page | Public (`GUEST`) | `/packages/:id` | MVP |
| **SCR-04** | Auth Portal (Login/Signup) | Public (`GUEST`) | `/login` | MVP |
| **SCR-05** | Tourist Profile & Bookings | Tourist (`TOURIST`) | `/profile` | MVP |
| **SCR-06** | Operator Dashboard | Operator (`OPERATOR`) | `/operator` | MVP |
| **SCR-07** | Admin Control Tower | Admin (`ADMIN`) | `/admin` | MVP |
| **SCR-08** | Booking Modal | Authenticated | Triggered on `/packages` | MVP |
| **SCR-09** | Package Creator Modal | Operator (`OPERATOR`) | Triggered on `/packages` & `/operator` | MVP |
| **SCR-10** | Help Center & FAQ | Public (`GUEST`) | `/help` | V2 |

---

# Phase 4 – Detailed Screen Specifications

### 4.1 Package Explorer (`SCR-02`)
- **Purpose:** Primary marketplace discovery grid where tourists filter and compare tour packages.
- **Primary Users:** Guest Visitors, Authenticated Tourists.
- **UI Components:** Header Search Input, Price Range Slider, Duration Badges, Package Cards Grid, Star Rating Pill, Verified Operator Badge.
- **States Handled:**
  - *Loading State:* Animated pulse skeleton grid (6 skeleton cards).
  - *Empty State:* Illustration showing "No packages listed yet!" with clear CTA.
  - *Error State:* Red alert card with retry action button.
- **Permissions:** Accessible to all users.
- **Validation Rules:** Price slider bounds must be non-negative (`min >= 0`).

### 4.2 Booking Modal (`SCR-08`)
- **Purpose:** Enables tourists to reserve seats for a specific travel date.
- **Primary Users:** Authenticated Tourists and Operators.
- **UI Components:** Date Selector with past-date disabling (`min={today}`), Passenger Counter (`1` to `10`), Dynamic Total Price Calculator, Confirm Button.
- **States Handled:**
  - *In-Flight:* Spinning loader on submit button.
  - *Success State:* Green checkmark banner with "Booking Confirmed!" notice.
  - *Error State:* Inline alert displaying server error (e.g. past date error or unauthorized role error).
- **Validation Rules:** `travelDate >= Today`, `passengers >= 1`.

---

# Phase 5 – Complete User Flows

```
[ GUEST VISITOR FLOW ]
  Landing Page (`/`) ──> Search Destination ──> Package Explorer (`/packages`) 
       ──> View Package Details ──> Click "Book Now" ──> Auth Guard Redirect (`/login`)

[ TOURIST BOOKING FLOW ]
  Auth Portal (`/login`) ──> Sign In (Role: TOURIST) ──> Redirect to `/packages` 
       ──> Open Booking Modal ──> Pick Date (>= Today) & Travelers ──> Confirm Booking 
       ──> Instant Confirmation Badge ──> View in "My Bookings" (`/profile`)

[ TOUR OPERATOR PUBLISHING FLOW ]
  Auth Portal (`/login`) ──> Sign Up (Role: OPERATOR) ──> Access Operator Dashboard (`/operator`) 
       ──> Click "+ Add New Package" ──> Fill Package Builder Form ──> Submit Package 
       ──> Auto-Associate Company Profile ──> Live Render on Marketplace Grid

[ ADMIN VERIFICATION FLOW ]
  Admin Portal (`/admin`) ──> View Registered Companies Table ──> Inspect License & GSTIN 
       ──> Click "Verify Agency" ──> Toggle `isVerified: true` in DB ──> Operator Granted Gold Badge
```

---

# Phase 6 – Detailed Task Flows

### 6.1 Task Flow: Booking a Tour Package
1. **Goal:** Reserve passenger seats on a selected tour package.
2. **Step 1:** Tourist clicks "Book Now" on a package card.
3. **Step 2:** System checks authentication state. If unauthenticated, user is redirected to `/login`.
4. **Step 3:** Booking modal renders with package title, cover image, and per-person price.
5. **Step 4:** Tourist selects a valid travel date (past dates disabled by `min={today}`).
6. **Step 5:** Tourist adjusts traveler counter. System recalculates `Total Price = Price × Passengers` live.
7. **Step 6:** Tourist clicks "Confirm Booking". Frontend issues `POST /api/bookings` payload with JWT.
8. **Step 7:** Server verifies token and date validity, writes `PENDING` booking record, and returns 201 Created.
9. **Step 8:** Modal displays green "Booking Confirmed!" checkmark and invalidates React Query cache.

--- 

# Phase 7 – Entity State Lifecycle Diagrams

```
[ PACKAGE LIFECYCLE ]
  Draft ──> Submitted for Verification ──> Approved & Published ──> Active / Bookable ──> Completed / Archived

[ BOOKING LIFECYCLE ]
  PENDING (Submitted by Tourist)
    │
    ├──> CONFIRMED (Accepted by Operator)
    │       │
    │       └──> COMPLETED (Trip finished)
    │
    └──> REJECTED / CANCELLED (Declined or refunded)

[ OPERATOR COMPANY LIFECYCLE ]
  Registered (Unverified) ──> Pending Review ──> Verified (`isVerified: true`) ──> Active Vendor
```

---

# Phase 8 – Role-Based Navigation & Access Matrix

| Interface Module | Guest Visitor | Tourist (`TOURIST`) | Tour Operator (`OPERATOR`) | Platform Admin (`ADMIN`) |
| :--- | :---: | :---: | :---: | :---: |
| **Home & Packages Explorer** | Read-Only | Read & Book | Read & Manage Own | Full Access |
| **My Bookings (`/profile`)** | Restricted | Full Access | Restricted | Read-Only Audit |
| **Operator Dashboard (`/operator`)** | Restricted | Restricted | Full Access | Read-Only Audit |
| **Admin Control Tower (`/admin`)** | Restricted | Restricted | Restricted | Full Access |
| **Package CRUD Controls** | Hidden | Hidden | Visible (Own Packages) | Full Override |

---

# Phase 9 – Core UX Design Principles & Aesthetic Guidelines

1. **Design Philosophy:** Clean, modern, high-contrast B2B2C marketplace layout utilizing sleek dark modes, subtle glassmorphic backdrop blurs, and crisp typography.
2. **Color Palette:**
   - **Primary Brand:** Vibrant Blue (`hsl(221.2, 83.2%, 53.3%)` / `#2563eb`).
   - **Success / Verified:** Emerald Green (`hsl(142.1, 76.2%, 36.3%)` / `#059669`).
   - **Warning / Pending:** Amber Gold (`hsl(37.7, 92.1%, 50.2%)` / `#d97706`).
   - **Backgrounds:** Slate Light (`#f8fafc`) / Dark Mode Slate (`#0f172a`).
3. **Micro-Interactions & Animations:** Smooth Framer Motion spring transitions (`duration: 0.4s`) on card hovers, modal scale-ins, and button clicks.
4. **Accessibility (WCAG 2.1 AA):** All text elements satisfy a minimum 4.5:1 contrast ratio; interactive inputs provide clear focus-ring indicators.

---

# Phase 10 – Detailed Wireframe Layout Descriptions

### 10.1 Desktop Layout Architecture
- **Header Region (64px height):** Fixed top container with logo on left, centered navigation links, and right-aligned user badge / theme toggle.
- **Main Content Container (Max width 1280px):** Centered layout with responsive 3-column grid for package listings (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- **Modal Containers:** Centered backdrop blur overlays (`bg-slate-900/60 backdrop-blur-sm`) containing rounded 3XL cards with explicit close triggers (`X` icon).

---

# Phase 11 – End-to-End User Journey Maps

| Touchpoint Phase | Tourist Emotion | Operator Emotion | Platform Touchpoint & System Reaction |
| :--- | :--- | :--- | :--- |
| **Discovery** | Excited / Curious | Passive | Tourist views landing page hero and filters packages by destination. |
| **Evaluation** | Analytical | Hopeful | Tourist inspects package details, duration, price, and operator verification status. |
| **Transaction** | Confident | Alerted | Tourist submits date/passenger booking; system sends notification to operator dashboard. |
| **Fulfillment** | Satisfied | Rewarded | Operator marks booking `COMPLETED`; tourist leaves 5-star review. |

---

# Phase 12 – Screen Prioritization & Release Phases

- **MVP Phase (Deployed):** Home (`/`), Packages (`/packages`), Auth Portal (`/login`), Operator Dashboard (`/operator`), Tourist Profile (`/profile`), Admin Dashboard (`/admin`), Booking Modal, Package Builder Modal.
- **Phase 2 (Beta):** In-App Messaging Modal, Escrow Payment Gateway, PDF Invoice Download.
- **Phase 3 (Production):** AI Itinerary Assistant, Multi-Currency Switcher, Real-Time SMS Notifications.

---

# Phase 13 – Final UX Architecture Audit & Recommendations

### UX Audit Findings
- **Strengths:** Zero-friction role switching between Tourists and Operators, clear date validation (`min={today}`), and responsive feedback modals.
- **Recommendation 1:** Add a direct "View Invoice / Download Voucher" button in the Tourist Profile for confirmed bookings.
- **Recommendation 2:** Provide real-time toast notifications when an Operator approves or rejects an incoming booking request.
