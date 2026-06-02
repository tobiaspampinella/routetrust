# SaaS Conversion Backlog

Last refreshed: 2026-06-01T21:30:00.000Z

## P0

- Fix reproducible build, smoke and beta gates.
- Provision local Postgres and set `DATABASE_URL`. **Partially done**: `docker-compose.yml` aligned, manual setup documented, but `prisma migrate dev` not run in this environment (no Docker/Postgres). See `docs/DB_LOCAL_STATUS.md`.
- Run `prisma validate`, `prisma generate`, first migration and seed. **Blocked** behind a reachable Postgres.
- Replace demo auth flow with DB-backed login and session lifecycle.
- Add tenant-scoped CRUD for users, bug reports and audit logs.

## P1

- Add tenant-scoped CRUD for drivers, routes, stops and incidents.
- Add approval requests and audit trail for route assignment.
- Add customer tracking token model and API.
- Add RBAC enforcement for admin, dispatcher, driver and viewer flows.

## P2

- Replace seeded CMS panels with live DB queries.
- Build public product pages with honest operational status.
- Add updates/version page backed by structured data.
- Add Railway staging pipeline and migration deployment runbook.

## P3

- Complete map provider abstraction around MapLibre plus OSRM/OpenRouteService.
- Add observability, rate limiting and stronger security headers.
- Add CI workflow enforcing typecheck, lint, test, build and smoke.
