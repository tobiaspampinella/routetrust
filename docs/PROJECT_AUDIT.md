# Project Audit

Date: 2026-05-30
Scope: restored ZIP, no new feature implementation

## Summary

The restored project is a functional Next.js demo/beta foundation for a logistics operational intelligence platform. It already contains CMS/Admin screens, demo tracking, driver views, local RBAC helpers, audit log helpers, route/tracking simulation utilities, Telegram status/test endpoints and governance docs. It is not yet a production SaaS backend: persistence, migrations, full tenant isolation, webtester coverage and CI need hardening.

## Architecture

- Single Next.js app with App Router.
- API routes are inside the web app.
- Prisma schema is present, but most product flows still rely on mock/local state.
- Auth middleware protects admin and driver paths.
- Human-in-the-loop behavior is visible in CMS/demo state but needs backend persistence.

## Frontend

- Landing, login, admin dashboard, CMS, driver and customer tracking demo routes exist.
- `/track/demo` is the strongest demo surface.
- Admin routes redirect unauthenticated users to login.
- UI is beta-demo oriented, not yet full enterprise SaaS.

## Backend/API

- Auth login/me/logout routes exist.
- Telegram status/test routes exist and require CMS configure permission.
- No versioned API namespace exists.
- No bug report API exists yet.

## CMS

- CMS modules are present in `/admin/cms`.
- Current implementation is largely local state/mock data.
- Needs persistence, admin bug panel, tenant CRUD backing store and approval workflows wired to durable audit logs.

## Demo Sandbox / Route Simulation

- Tracking simulation utilities exist in `src/lib/trackingSimulation.ts`.
- Demo sandbox behavior exists in CMS and customer tracking components.
- Event names requested for `route.simulation.*` are not formalized as backend/domain events yet.

## Maps/Tracking

- Google Maps provider readiness is documented in README and UI.
- Local fallback is present.
- MapLibre/OpenStreetMap package integration is not yet installed as a concrete dependency.
- Google TrafficLayer/Routes/3D and Apple MapKit remain research/integration tasks.

## Telegram

- Protected status/test API endpoints exist.
- No webhook handler or command router exists yet.
- No secrets are hardcoded.

## Bug Assistant

- `CxAssistantWidget` exists, but the requested bug reporting assistant is not complete.
- No durable BugReport model/API/admin panel exists yet.

## Auth/RBAC/Tenant Isolation

- Demo auth and role middleware exist.
- RBAC matrix exists for CMS permissions.
- Tenant isolation is not proven against a real database.

## Audit Logs

- Audit log helper and seed logs exist.
- Critical action logging needs backend persistence and coverage.

## Tests/QA

- No test script, Playwright or Cypress config restored.
- Manual smoke validation passed after dev server start.

## Beta Risks

- Next.js security warning.
- No Docker available locally to validate DB/Redis.
- No automated E2E coverage.
- Several required beta modules are mock/demo-first.
- Git was not included in ZIP and must be initialized before professional repo workflow.
