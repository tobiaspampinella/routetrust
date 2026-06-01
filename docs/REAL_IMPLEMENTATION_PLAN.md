# Real Implementation Plan

Status date: 2026-06-01

## Current classification

| Module | Status | Reality |
| --- | --- | --- |
| Public site | PARTIAL_IMPLEMENTED | Real Next.js pages, still mixed with demo claims and local-only assumptions. |
| Admin CMS | PARTIAL_IMPLEMENTED | UI exists, most data still seeded or file-backed. |
| Auth | PARTIAL_IMPLEMENTED | Signed cookie exists, no real user database flow enforced. |
| Bug reports | PARTIAL_IMPLEMENTED | DB-backed when available, file fallback otherwise. |
| Audit logs | PARTIAL_IMPLEMENTED | DB-backed when available, file fallback otherwise. |
| Tenants and users | PARTIAL_IMPLEMENTED | Prisma models exist, no live CRUD path yet. |
| Routes, drivers, incidents | DEMO_ONLY | Operational UI exists without real tenant-scoped backend. |
| Maps | PARTIAL_IMPLEMENTED | Renderer/fallback direction exists, provider abstraction still incomplete. |
| Staging | MISSING | No verified staging deployment or env contract execution. |

## Phase order

1. Baseline integrity
   - Keep `typecheck`, `lint`, `test`, `build`, `qa:smoke`, `qa:security` reproducible.
   - Stop using network-dependent build assets.
   - Keep health and beta gates honest.

2. Persistence base
   - Finalize Prisma schema for minimum SaaS core.
   - Run migration only after a real `DATABASE_URL` exists.
   - Seed demo tenant and users without shipping secrets.

3. Real auth and tenant scoping
   - Replace demo-only assumptions with user lookup by database.
   - Enforce tenant checks on admin, driver and tracking APIs.
   - Add RBAC matrix and middleware coverage.

4. Core backend
   - Routes, stops, incidents, approvals and tracking tokens move from demo state to DB-backed APIs.
   - Audit logging becomes first-class for CRUD and approvals.

5. Product and staging
   - Public product pages move to honest SaaS messaging.
   - Railway staging with Postgres, env contract and deploy checks.

## Immediate blockers

- `DATABASE_URL` missing in the local environment.
- Prisma migration cannot be executed honestly without a reachable Postgres instance.
- Worktree is dirty, so stable cannot be claimed.
- Real auth, tenant isolation and route CRUD are not implemented yet.
