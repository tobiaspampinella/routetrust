# SaaS Migration Plan

Generated: 2026-06-01
Recommended architecture: Modular Next.js monolith + PostgreSQL + Prisma + Railway for beta.

## Phase 0: Stop False Claims

Status labels must remain:

- `LOCAL_DEMO_READY: YES`
- `BETA_STABLE_READY: NO`
- `STAGING_READY: NO`
- `SAAS_IMPLEMENTABLE: NO`

Acceptance:

- No README, dashboard, footer or docs claim production readiness.
- Demo paths are explicitly labeled demo.

## Phase 1: Production Env Contract

Tasks:

- Define required env variables for production.
- Fail startup if `DATABASE_URL`, auth secret and app URL are missing.
- Keep `DEMO_MODE=true` local only.

Acceptance:

- `npx prisma validate` passes with configured `DATABASE_URL`.
- `/api/health` returns `ok` only when DB, auth and storage are ready.

## Phase 2: Prisma Migration Baseline

Tasks:

- Convert schema draft into first migration.
- Add DB seed for demo tenant.
- Add `prisma migrate deploy` to deployment flow.

Acceptance:

- Fresh DB can be migrated and seeded.
- Demo tenant data loads from DB, not source code.

## Phase 3: Auth And Tenant Isolation

Tasks:

- Replace `testUsersDb` with DB users or external auth.
- Persist roles and tenant membership.
- Require tenant context on protected API reads/writes.

Acceptance:

- Admin cannot access tenant data outside membership.
- Driver sees only assigned route/tenant.
- Session token does not contain unvalidated role authority.

## Phase 4: Backend APIs

Build API modules in this order:

1. tenants
2. users and roles
3. drivers
4. routes
5. stops
6. incidents
7. approvals
8. audit logs
9. bug reports
10. project status

Acceptance:

- Admin dashboard reads DB-backed APIs.
- Driver actions write delivery events.
- Customer tracking reads by public tracking token.

## Phase 5: Operational Event Ledger

Tasks:

- Create immutable delivery event table.
- Store status transitions, actor, timestamp and tenant.
- Derive KPI snapshots from events.

Acceptance:

- Route and delivery history survives reloads and multi-user sessions.
- Audit report can reconstruct who changed what.

## Phase 6: Staging

Tasks:

- Deploy to Railway with Postgres.
- Configure staging env.
- Run CI plus smoke against staging URL.

Acceptance:

- `STAGING_URL` exists.
- `npm run beta-check` passes except explicitly accepted SaaS gaps.
- Browser smoke is clean, not flaky.

## Phase 7: Beta Stable

Required:

- clean Git tree
- remote CI passing
- staging smoke passing
- DB persistence
- auth secret configured
- tenant guard tests
- audit logs DB-backed
- no local filesystem business persistence
