# Wanderers – Complete Feature Breakdown & Product Specification (Session 2 – Master Document)

**Role:** Product Manager, Chief Product Officer, Senior Business Analyst & Tourism Domain Expert  
**Document Type:** Production-Ready Feature Requirements Specification  
**Baseline:** Extends Existing MVP Architecture v1.0 (Node.js, Express, Prisma, SQLite/PostgreSQL, React, Vite)  

---

# MODULE 1: Authentication & Access Control (MOD-01)

### Module Perspectives
- **Business Perspective:** Protects application data integrity, prevents fraudulent access, and segregates permissions between Tourists, Operators, and Admins.
- **User Perspective:** Low-friction, secure login/signup experience with reliable session persistence.
- **Operator Perspective:** High-trust business entry point ensuring verified corporate identities.
- **Admin Perspective:** Audited identity management with emergency account suspension capabilities.
- **Technical Considerations:** Stateless JWT auth tokens (7-day expiry), bcrypt password hashing (10 salt rounds), redis-backed token blacklisting for logouts.

--- 

### 1.1 Email Registration & 1.2 Login
- **Module:** MODULE 1 – Authentication
- **Priority:** Critical (MVP)
- **Business Objective:** Provide registration and authentication channels for tourists and operators.
- **Acceptance Criteria:** Valid registration stores bcrypt hashed password and issues JWT. Login verifies hash and returns token.

### 1.3 Google Login (SSO) & 1.4 Password Recovery
- **Module:** MODULE 1 – Authentication
- **Priority:** High (MVP)
- **Business Objective:** OAuth Google integration and self-service email tokenized password reset links.
- **Acceptance Criteria:** Google SSO authenticates user; reset password link updates hash securely.

--- 

# MODULE 2: Tourist Profile & Travel Preferences (MOD-02)

### Module Perspectives
- **Business Perspective:** Captures user travel preferences to optimize package recommendation algorithms.
- **User Perspective:** Central dashboard to manage personal details, active bookings, wishlist items, and emergency contacts.

--- 

### 2.1 Personal Info & Wishlist Management
- **Module:** MODULE 2 – Tourist Profile
- **Priority:** High (MVP)
- **Business Objective:** Store name, phone, preferences, and toggle heart wishlist items.
- **Acceptance Criteria:** Wishlisted packages render in `/profile/wishlist` tab.

### 2.2 Booking History & Emergency Contacts
- **Module:** MODULE 2 – Tourist Profile
- **Priority:** Critical (MVP)
- **Business Objective:** Track upcoming/past bookings and record emergency contact details for tour manifests.
- **Acceptance Criteria:** Emergency contact details populated into operator passenger manifest.

--- 

# MODULE 3: Tour Operator Profile & Verification (MOD-03)

### Module Perspectives
- **Business Perspective:** Compliance gate verifying operator legal registration, GSTIN, and business licenses.
- **Operator Perspective:** Storefront showcasing accreditation badges, company gallery, and office location.

--- 

### 3.1 Company Onboarding & GST Validation
- **Module:** MODULE 3 – Tour Operator Profile
- **Priority:** Critical (MVP)
- **Business Objective:** Ingest legal name, GSTIN, and PDF business licenses.
- **Acceptance Criteria:** Submitting form updates company state to `Pending Review` until Admin verification.

--- 

# MODULE 4: Package Management System (MOD-04)

### Module Perspectives
- **Business Perspective:** Inventory generation engine for the marketplace.
- **Operator Perspective:** Complete control over pricing, duration, day-by-day itineraries, and inclusions.

--- 

### 4.1 Package Creator & Editor
- **Module:** MODULE 4 – Package Management
- **Priority:** Critical (MVP)
- **Business Objective:** Form builder for Title, Destination, Price ($ USD), Duration (Days), Cover Image, Description, and Itinerary.
- **Acceptance Criteria:** Operator submits form; package immediately updates/appears on `/packages` grid.

### 4.2 Package Deletion & Status Management
- **Module:** MODULE 4 – Package Management
- **Priority:** High (MVP)
- **Acceptance Criteria:** Deleting a package removes it from active search without invalidating active customer bookings.

--- 

# MODULE 5: Search & Discovery (MOD-05)

### Module Perspectives
- **Business Perspective:** Connects tourists to relevant packages quickly to drive booking conversion.

--- 

### 5.1 Parametric Search & Filtering
- **Module:** MODULE 5 – Search
- **Priority:** Critical (MVP)
- **Acceptance Criteria:** Filtering by destination, max price, or duration updates package grid dynamically.

--- 

# MODULE 6: Package Details (MOD-06)

### Module Perspectives
- **Business Perspective:** High-converting listing page displaying full day-by-day itineraries, inclusions, exclusions, and operator verification badges.

--- 

# MODULE 7: Booking System (MOD-07)

### Module Perspectives
- **Business Perspective:** Primary transaction engine.

--- 

### 7.1 Booking Modal & Past-Date Guard
- **Module:** MODULE 7 – Booking System
- **Priority:** Critical (MVP)
- **Acceptance Criteria:** Date input disables past dates (`min={today}`). Total price calculates live (`price * passengers`). Submitting creates booking with status `PENDING`.

--- 

# MODULE 8: Payments & Invoicing (MOD-08)

### Module Perspectives
- **Business Perspective:** Secure payment capture, tax breakdown, and automated invoice PDF generation.

--- 

# MODULE 9: Customer Reviews & Rating Engine (MOD-09)

### Module Perspectives
- **Business Perspective:** Social proof drive and organic quality assurance.
- **User Perspective:** Read reviews from verified buyers before booking.

--- 

### 9.1 Verified Buyer Reviews & Moderation
- **Module:** MODULE 9 – Reviews
- **Priority:** High (MVP)
- **Description:** 1-to-5 star rating and comment submission restricted to tourists with completed bookings (`status === 'COMPLETED'`).
- **Acceptance Criteria:** Non-buyers cannot post reviews; package star rating updates dynamically.

--- 

# MODULE 10: In-App Messaging (MOD-10)

### Module Perspectives
- **Business Perspective:** Keeps communication between tourists and operators on-platform.
- **Priority:** Version 2 (V2)
- **Description:** Real-time chat channel between booked Tourist and Tour Operator.
- **Acceptance Criteria:** Chat channel opens automatically upon booking confirmation.

--- 

# MODULE 11: Multi-Channel Notifications (MOD-11)

### Module Perspectives
- **Business Perspective:** Keeps users engaged and reduces booking drop-off.
- **Priority:** Critical (MVP)
- **Description:** Email lifecycle triggers on registration, booking creation, status changes, and reminder alerts.
- **Acceptance Criteria:** Placing a booking sends email notification to both Tourist and Operator.

--- 

# MODULE 12: Admin Management Dashboard (MOD-12)

### Module Perspectives
- **Business Perspective:** Operational control tower for platform governance.
- **Priority:** Critical (MVP)
- **Description:** Admin panel to review operator verification documents, toggle `isVerified` status, and view overall transaction metrics.
- **Acceptance Criteria:** Admin toggling `isVerified` grants operator publishing rights.

--- 

# MODULE 13: Operator Dashboard (MOD-13)

### Module Perspectives
- **Business Perspective:** Commercial cockpit for operators to monitor business performance.
- **Priority:** Critical (MVP)
- **Description:** Overview of active listings, incoming tourist bookings, customer roster, and revenue analytics.
- **Acceptance Criteria:** Operator can approve or reject incoming booking requests.

--- 

# MODULE 14: AI Capabilities (MOD-14)

### Module Perspectives
- **Business Perspective:** Differentiated tech moat increasing discovery efficiency.
- **Priority:** Version 2 / Version 3
- **Description:** Smart semantic search, automated packing checklist generator, and AI itinerary summarizer.
- **Acceptance Criteria:** AI packing checklist auto-populates based on destination weather and trip length.

--- 

# MODULE 15: Analytics & Growth Intelligence (MOD-15)

### Module Perspectives
- **Business Perspective:** Tracks marketplace Gross Merchandise Value (GMV), customer acquisition costs, and popular destinations.
- **Priority:** Version 2 (V2)
- **Description:** Interactive charts displaying booking velocity and top-performing tour operators.

--- 

# MODULE 16: Customer Support & Help Center (MOD-16)

### Module Perspectives
- **Business Perspective:** Resolves tourist inquiries and prevents chargebacks.
- **Priority:** High (MVP)
- **Description:** Self-service FAQ library and support ticket submission form.
- **Acceptance Criteria:** User can submit ticket; support admin receives notification in admin panel.

--- 

# RECOMMENDED FEATURES (Strategic Additions)

| Feature Name | Primary Beneficiary | Business Purpose & Justification |
| :--- | :--- | :--- |
| **Emergency SOS & Location Share** | Tourists / Operations | One-tap emergency broadcast transmitting live GPS coordinates to operator during active tours. |
| **Dynamic Group Discount Tiers** | Tourists / Operators | Automatically scales down per-person cost when booking for 4+ passengers, increasing average order value. |
| **Escrow Payout Release Lock** | Platform / Finance | Funds held in escrow until 24h post-trip completion, mitigating fraud risk and ensuring customer satisfaction. |
| **Multi-Currency Converter** | International Tourists | Automatic currency conversion (USD, EUR, GBP, INR) for global traveler convenience. |
