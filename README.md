# Shri Kutch Gurjar Kshatriya Samaj - Digital Family Record Portal

A fullstack **Digital Family Record Portal** representing a clean, elegant, and professional-grade census registry platform for the community. Designed under a **Heritage Cream Theme**, this portal replaces the traditional paper-based census correction forms with an intuitive, secure, and responsive digital experience.

---

## 📜 Vision & Core Values
*   **Aesthetic Principle**: A clean, premium "Old Family Record Book meets Modern Banking Portal" feel. Uses curated Heritage Cream colors, elegant double-borders, and subtle decorative lotus dividers.
*   **Minimalist & Text-Free Branding**: Utilizes a custom-designed, minimalist, text-free Lotus logo matching the color theme as its favicon and community identifier.
*   **Elderly Friendly**: Straightforward navigation with clear labels, zero flashy animations, large readable buttons, and dual-mode login supporting both standard Password and simple OTP.

---

## 🌟 Key Features

1.  **Dual Authentication**
    *   **Mobile + Password**: Quick login for regular users.
    *   **Mobile + OTP**: Password-free login utilizing a simulated OTP service that delivers codes directly to client toast notifications during local development.
    *   **Census-Validated Registration**: Users can register by matching their Family ID + Mobile Number against pre-existing census records.

2.  **Instant Multi-Language (i18n) Support**
    *   Day-1 translation support for **English**, **Hindi (हिन्दी)**, and **Gujarati (ગુજરાતી)**.
    *   A header selector updates all form fields, menu text, tooltips, and verification records instantly in the browser without reloading the page.

3.  **Role-Based Security & Dashboards**
    *   **Family User**: Can view their family census details, inspect member cards, track correction requests, and submit updates.
    *   **Ghatak Admin**: Manages verifications queue, statistics, and correction approvals for families in their specific Ghatak.
    *   **Pradeshik Admin**: Views census analytics, regional distributions, and handles user accounts within their province.
    *   **Super Admin**: Holds full system administration access, user management, global audit logs, and data exports.

4.  **7-Step Census Correction Wizard**
    Mirrors the structure of the traditional paper-based census form to avoid user confusion:
    *   **Step 1**: Family Information updates (address, village, phone).
    *   **Step 2**: Add Family Member profile.
    *   **Step 3**: Remove Family Member (specify reason like partition or marriage).
    *   **Step 4**: Transfer Member (move to a different Family ID).
    *   **Step 5**: Describe miscellaneous corrections.
    *   **Step 6**: Upload verification documents.
    *   **Step 7**: Compile, review differences, and submit.

5.  **Side-by-Side Review Queue**
    *   Administrators view a clean, side-by-side comparison of **Old Value vs New Value** for fields, new member detail cards, and removal/transfer reasons, with quick actions to Approve, Reject, or Request Corrections.

6.  **Global Audit Logging**
    *   Tracks all system activities chronologically (logins, password updates, request submissions, and verifier decisions) to maintain database audit integrity.

---

## 🛠️ Technology Stack
*   **Frontend**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4.
*   **Database & ORM**: PostgreSQL (hosted on Neon), Prisma ORM (v5.22.0).
*   **Authentication**: JSON Web Token (JWT) signed and verified using `jose` to be natively compatible with Next.js Edge Runtime Middleware.
*   **Icons**: Lucide Icons.

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the root of the `frontend` folder containing your hosted database connection and JWT secret:
```env
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require"
JWT_SECRET="your-32-character-secret-key-goes-here"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Sync Database & Seed Data
Push the schema definitions and seed the default regions, sample families, and dev accounts:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🔑 Pre-seeded Test Accounts

Use these pre-seeded accounts in the **Quick Login** section to test different role dashboards:

| Role | Mobile Number | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `9999999999` | `AdminPassword123!` | System-wide Audit Logs, stats, exports |
| **Pradeshik Admin** | `8888888888` | `Pradeshik123!` | Gujarat Region stats, regional distributions |
| **Ghatak Admin** | `7777777777` | `Ghatak123!` | Bhuj verifications queue, approvals/rejections |
| **Family User** | `9876543210` | `UserPassword123!` | View Param Family details, submit correction requests |

---

## 👨‍💻 Credits & Maintenance
Developed & Maintained by **Param Khodiyar** — Version 1.0
