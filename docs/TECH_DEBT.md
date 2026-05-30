# Technical Debt

Date: 2026-05-30

## Critical

- Upgrade Next.js from `15.1.3` to a patched version after restore branch is stable.
- Add automated E2E tests for beta paths.
- Validate Prisma migrations against a real Postgres instance.
- Initialize Git and connect the intended GitHub remote.

## High

- Replace mock CMS state with durable tenant-scoped persistence.
- Formalize route simulation events and audit logs.
- Add BugReport model/API/admin panel.
- Add Telegram webhook and command router.
- Add CI workflow and branch protection expectations.

## Medium

- Upgrade Recharts 2 to v3.
- Add MapLibre dependency and provider abstraction.
- Add `.env.local.example` or setup script if local onboarding remains manual.
- Normalize README instructions around restored project root.

## Deferred

- Google Photorealistic 3D.
- Apple MapKit JS integration.
- Full ERP/TMS modules outside beta scope.
