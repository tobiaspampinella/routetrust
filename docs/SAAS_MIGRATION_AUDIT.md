# SaaS Migration Audit

Generated: 2026-06-01
Audit role: SaaS Migration Architect Agent

## Verdict

RouteTrust has a useful Next.js demo shell and a Prisma schema draft. It does not yet have a SaaS backend. Migration must replace local state and local files with a DB-backed tenant model before selling implementation.

## Current Readiness By Area

| Area | Current state | SaaS gap |
|---|---|---|
| DB real | Prisma schema exists; `DATABASE_URL` missing | migrations, client integration, deployed DB |
| Auth real | signed cookie over static test users | identity provider or DB users, password policy, sessions |
| RBAC real | static matrix | persisted roles, per-tenant assignments |
| Tenant isolation | hardcoded allowlist | DB-enforced tenant scope in every query |
| CMS real | seed object | CRUD APIs and audit log |
| Deploy real | local build/start works | staging/prod pipelines |
| Staging URL | missing | required |
| Logs | runtime JSON and local scripts | centralized logs, request IDs |
| Observability | none production-grade | metrics, alerts, traces |
| Backup | none | DB backup and restore drill |
| Secrets | `.env.example` exists | platform secrets and startup validation |
| Env contract | partial | typed, documented, fail-fast |
| CI/CD | remote CI exists | current dirty tree not validated remotely |
| Healthcheck | exists, degraded | production readiness gates |
| Seed demo | hardcoded | DB seed script and demo tenant |
| Migrations | none applied | Prisma migrate workflow |
| Tenant onboarding | not implemented | company setup, users, modules |
| KPIs real | calculated from mock state | persisted events and snapshots |
| Roles empresariales | type/matrix only | assignments, audit, admin controls |

## Option A: Next.js + PostgreSQL + Prisma + Vercel/Railway

Pros:

- fastest migration from current code
- Prisma schema already exists
- Next.js app router fits current project
- Railway is a good beta fit for app + Postgres

Cons:

- Vercel serverless conflicts with current filesystem writes
- background jobs and realtime need extra services
- strict env and DB connection management required

## Option B: Next.js + NestJS + PostgreSQL + VPS

Pros:

- clearer backend boundary
- stronger long-term architecture for logistics operations
- easier queues, websockets and integrations

Cons:

- bigger migration
- slower beta
- requires DevOps maturity now

## Option C: Modular Next.js Monolith + Postgres + Railway/Render

Pros:

- lowest migration cost
- keeps current UI and route handlers
- supports DB, migrations and a persistent Node runtime
- enough for controlled beta

Cons:

- must enforce module boundaries manually
- may need extraction later

## Recommended For Beta

Option C: modular Next.js monolith + PostgreSQL + Prisma + Railway.

Reason: RouteTrust is not ready for a service split. The immediate need is durable tenant-scoped backend, not microservice architecture. Railway's Next.js + Postgres path directly matches the missing `DATABASE_URL` and migration problem.

## Authoritative References

- Next.js deployment: https://nextjs.org/docs/app/getting-started/deploying
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- Railway Next.js + Postgres: https://docs.railway.com/guides/nextjs
- Render Next.js: https://render.com/docs/deploy-nextjs-app
- Vercel env variables: https://vercel.com/docs/environment-variables
- Prisma production migrations: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
