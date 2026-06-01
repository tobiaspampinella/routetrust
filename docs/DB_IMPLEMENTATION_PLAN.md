# DB Implementation Plan

## Objective

Move RouteTrust from local JSON durability to PostgreSQL plus Prisma without breaking the existing admin-driver-customer demo flow.

## Current state

- Prisma schema exists and now includes `Tenant`, `User`, `Driver`, `Route`, `RouteStop`, `AuditLog` and `BugReport`.
- `BugReport` and `AuditLog` now write to PostgreSQL when DB is reachable.
- File storage remains as fallback when `DATABASE_URL` is missing or broken.
- No migration has been applied in this cycle because no real `DATABASE_URL` was provided.

## Minimum next execution

1. Provision Postgres locally or on Railway.
2. Set `DATABASE_URL` in `.env.local`.
3. Run:
   - `npx prisma validate`
   - `npx prisma generate`
   - `npx prisma migrate dev --name init_real_saas_core`
   - `npx prisma db seed`
4. Verify:
   - `GET /api/health` reports `checks.db = ok`
   - bug reports persist in DB
   - audit events persist in DB

## Initial real models

- `Tenant`
- `User`
- `BugReport`
- `AuditLog`

## Deferred models

- `Incident`
- `ApprovalRequest`
- `DeliveryEvent`
- `CustomerTrackingToken`
- `ProjectEvent`
- `ApiIntegration`

## Blocked items

- Migration SQL and deployment execution are blocked until `DATABASE_URL` exists.
