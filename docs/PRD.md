# Product Requirements Document (PRD)
## Shri Kutch Gurjar Kshatriya (KGK) Samaj Community Census Portal

---

## 1. Executive Summary & Vision

The **Shri Kutch Gurjar Kshatriya (KGK) Samaj Community Census Portal** is a centralized, digital census enumerator and administrative platform designed for the worldwide KGK Samaj community. The portal enables community families across India and international regions (NRIs in Kenya, UAE, UK, USA, Canada, Australia, etc.) to securely register, verify, update, and manage their family census records, while providing multi-tiered governance tools for Ghatak, Pradeshik, and Global Admins.

---

## 2. Objectives & Key Results (OKRs)

- **Digitization & Accuracy**: Replace legacy paper census records with a single, real-time database with audit capabilities.
- **Family-Centric Security**: Restrict write access to verified **Family Heads**, preventing unauthorized modifications by third parties or non-head relatives.
- **Seamless Authentication**: Provide a passwordless, pure OTP-based sign-in mechanism leveraging WhatsApp (Twilio/Meta API) and responsive HTML emails.
- **Regulatory Compliance**: Full compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**, incorporating explicit consent capture and audit trailing.
- **Multilingual Inclusivity**: Full tri-lingual interface support (English, Hindi `हिन्दी`, Gujarati `ગુજરાતી`).

---

## 3. User Personas & Target Audiences

### Persona 1: Family Head (`USER` Role)
- Primary contact for a family census unit.
- Responsible for adding/updating family member records (wives, sons, daughters, elderly parents), declaring blood groups, education, occupation, and contact info.
- Submits modification requests when family structures change (births, marriages, address changes, bereavements).

### Persona 2: Ghatak Admin (`GHATAK_ADMIN` Role)
- Oversees a local community sub-region/cluster (Ghatak).
- Approves or rejects standard profile update requests submitted by Family Heads within their assigned Ghatak.

### Persona 3: Pradeshik Admin (`PRADESHIK_ADMIN` Role)
- Oversees a broader state/provincial territory (Pradeshik).
- Handles escalated requests, cross-Ghatak transfers, regional analytics, and regional notice broadcasts.

### Persona 4: NRI Admin (`NRI_ADMIN` Role)
- Special administrator for international/diaspora families outside India.
- Reviews and approves new family join/enrollment requests submitted by NRI families.
- Exports structured NRI family census data to CSV for community registry publishing.

### Persona 5: Super Admin (`SUPER_ADMIN` Role)
- Has global access to all system modules: audit logs, rate limit monitor, notice management, system-wide analytics, user role elevation, and database operations.

---

## 4. Key Functional Features

### 4.1 Pure OTP Authentication & Passwordless Access
- Single-input entry supporting both mobile numbers (10-digit or international format) and email addresses.
- Auto-dispatch of 6-digit verification codes via:
  - **WhatsApp**: Twilio Sandbox or Meta Cloud API integration.
  - **Email**: Minimalist HTML email template sent via SMTP (Gmail / custom server).
- IP-based and Phone-based Rate Limiting (max 5 requests per IP, max 3 OTP sends per number in 15 mins).
- Security lockout after 5 invalid verification attempts.

### 4.2 Account Activation & Family Head Validation
- **Head-Only Access Constraint**: Non-head family members are prevented from logging in independently; they are directed to contact their Family Head.
- **Unregistered / NRI Flow**: Non-enrolled families can submit an NRI Join Request for admin review.
- **DPDP Act 2023 Consent**: Explicit checkbox capturing digital consent timestamp (`consentGivenAt`).

### 4.3 Edit Family Wizard & Change Request Engine
- Multi-step interactive wizard for Family Heads:
  - **Step 1**: General Family Details (address, native village in Kutch, city/country).
  - **Step 2**: Family Members Management (add member, update age, occupation, education, blood group, marital status).
  - **Step 3**: Document Attachments (identity proofs, certificates).
  - **Step 4**: Submission & Review.
- **Approval Pipeline**: Changes create an `UpdateRequest` record with granular `RequestChange` field diffs (storing old and new JSON values). Admins review, comment, approve, or request corrections.

### 4.4 Grievance & Support Ticketing
- Integrated grievance portal allowing Family Heads to submit support tickets regarding census discrepancies.
- Status tracking: `OPEN`, `IN_REVIEW`, `RESOLVED` with admin notes.

### 4.5 Community Notices & Announcements
- TipTap rich-text HTML notice publisher for admins.
- Dynamic announcement banner on dashboard header for critical community news.

### 4.6 Analytics & Reports
- Interactive charts: Age demographics breakdown, blood group distribution, population per native village in Kutch, gender ratio, and territorial distribution.
- One-click CSV export for NRI records.

---

## 5. Non-Functional Requirements (NFRs)

| Category | Requirement |
| :--- | :--- |
| **Performance** | Page load < 1.5s; server action response time < 300ms. |
| **Security** | SHA-256 hashed OTP codes, HTTP-only JWT cookies, Turnstile CAPTCHA verification, complete IP audit log. |
| **Accessibility & Design** | Modern Heritage Cream aesthetic (`#FAF7F2` cream, `#8B5E3C` warm terracotta brown, `#2D2D2D` dark text). Fully mobile-responsive layout. |
| **Localization** | Dynamic client-side language switcher context with React state and fallback translations. |
