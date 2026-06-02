# Sprint Plan

Generated: 2026-06-01

## Sprint 0: Stabilize Truth

Duration: 2 days

Goals:

- Freeze claims.
- Clean validation baseline.
- Fix flaky smoke.
- Document env contract.

Acceptance:

- No beta stable claim.
- Smoke clean in repeated runs.
- Dirty tree handled.
- Prisma validation path known.

## Sprint 1: DB Foundation

Duration: 1 week

Goals:

- Configure Postgres.
- Create first migration.
- Seed demo tenant.
- Replace static tenants/users path.

Acceptance:

- `DATABASE_URL` configured.
- `prisma migrate deploy` works.
- tenants/users are DB-backed.

## Sprint 2: Operational Backend

Duration: 1 week

Goals:

- Routes/stops/drivers APIs.
- Driver delivery events.
- DB audit logs.
- Tenant-scoped guards.

Acceptance:

- Driver actions persist.
- Admin dashboard reads backend.
- Tenant leakage tests exist.

## Sprint 3: Staging Beta

Duration: 1 week

Goals:

- Railway/Render staging deploy.
- Staging smoke.
- Public route completion.
- Shared state components.

Acceptance:

- `STAGING_URL` configured.
- CI and staging smoke pass.
- Public funnel is coherent.
