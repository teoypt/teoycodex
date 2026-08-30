# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Supabase is the planned backend platform, but this UI phase does not connect to it.

## Users

- `Admin`: the primary user for the first surface. Admins can sign in and access every product page.
- `User`: can access only general user-facing pages. The user's domain-specific job is still undecided.

## Product Purpose

Teoycodex is in discovery. This phase establishes the first Admin landing page and the role-based product shell while the core business domain and workflow remain open decisions.

## Operating Context

The current deliverable is a responsive Admin surface connected to Supabase Auth and Postgres. It provides authenticated entry points for user, role, and audit management.

## Capabilities and Constraints

- MVP roles are limited to `Admin` and `User`.
- Admin can access all authenticated routes; User cannot access Admin routes.
- Authorization must eventually be enforced by the backend/API, not only by hidden UI.
- The application requires Supabase and reads production-shaped data through RLS-protected queries.
- The core workflow, primary business entity, authentication method, notification channel, and detailed page scope remain undecided.

## Brand Commitments

- Product name: Teoycodex.
- UI direction: minimal, spacious, readable, responsive, and restrained in color.

## Evidence on Hand

- `PRD.md` is the sole product source.
- No approved logo, customer evidence, testimonials, performance claims, business data, or production content exists. Future work must not fabricate these as real claims.

## Product Principles

- Keep role and permission boundaries explicit.
- Prefer clear task entry points over decorative dashboard density.
- Surface connection and authorization failures explicitly.
- Keep all product data behind Supabase RLS and server-side authorization checks.
- Treat accessibility and responsive behavior as baseline requirements.

## Accessibility & Inclusion

Target WCAG 2.2 AA for the main Admin workflow; final browser and assistive-technology support remains to be confirmed.
