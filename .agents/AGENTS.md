# AGENTS.md — Workspace Rules & Architecture Guidelines

## Architecture & System Design Documentation References

Whenever researching, implementing features, or modifying the codebase, refer to the authoritative documentation located in `frontend/docs/`:

1. **[Product Requirements (PRD.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/PRD.md)**: User personas, functional requirements, DPDP compliance.
2. **[Entity Relationship Diagram (ERD.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/ERD.md)**: Database schemas, relations, and model constraints.
3. **[System Design (SYSTEM_DESIGN.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/SYSTEM_DESIGN.md)**: Architecture, Pure OTP authentication engine, RBAC matrix, rate limiting, and security rules.
4. **[UX & Pipeline Specification (UX_PIPELINE.md)](file:///Users/paramkhodiyar/Samaj/frontend/docs/UX_PIPELINE.md)**: Sequence diagrams, wizard pipelines, and approval workflows.

## Key Rules & Guidelines

- **Authentication**: The portal uses passwordless **Pure OTP Authentication**. Do not introduce password fields into login/activation screens.
- **Access Control**: Restrict regular user sign-in to verified **Family Heads**. Non-head members must be blocked gracefully.
- **DPDP Act 2023**: Ensure explicit consent capture timestamps (`consentGivenAt`) when creating or activating accounts.
- **Design System**: Follow the Heritage Cream aesthetic (`#FAF7F2` background, `#8B5E3C` warm terracotta brown, `#2D2D2D` dark typography).
