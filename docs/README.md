# System Design & Architecture Documentation Master Index
## Shri Kutch Gurjar Kshatriya Samaj Census Portal

Welcome to the central system design and architecture documentation hub for the KGK Samaj Census Portal. These documents serve as the authoritative reference for developers and AI coding agents.

---

## 📚 Documentation Index

1. **[Product Requirements Document (PRD.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/PRD.md)**
   - Executive Vision, OKRs, User Personas (Family Head, Ghatak Admin, Pradeshik Admin, NRI Admin, Super Admin), Core Functional Features, DPDP Act 2023 Compliance, and Non-Functional Requirements.

2. **[Entity Relationship Diagram & Database Specs (ERD.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/ERD.md)**
   - Mermaid ER Diagram, PostgreSQL table specs, Prisma model schemas, indexes, foreign keys, and audit logging structures.

3. **[System Design & Technical Architecture (SYSTEM_DESIGN.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/SYSTEM_DESIGN.md)**
   - High-level architecture diagram, Tech Stack choices, Pure OTP Engine mechanism (WhatsApp & Nodemailer SMTP), Dual-Tier Rate Limiting, Turnstile CAPTCHA, and Role-Based Access Control (RBAC) matrix.

4. **[User Experience & Workflow Pipelines (UX_PIPELINE.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/UX_PIPELINE.md)**
   - End-to-end user journeys, Sequence diagrams for Pure OTP sign-in, Edit Family Wizard pipelines, NRI Family Enrollment workflow, and future UX roadmap.

---

## 🚀 Quick Reference Commands

- **Type Check**: `npx tsc --noEmit`
- **Email SMTP Test**: `npx tsx scripts/test-email.ts`
- **Database Studio**: `npx prisma studio`
