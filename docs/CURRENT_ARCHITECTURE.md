# Current Architecture - RoutePulse AI

Date: 2026-05-27
Owner: Principal AI Node Orchestrator / Lead Full Stack Engineer
Status: Day 1 architecture audit completed. Schema is awaiting human approval.

## Executive Summary

The current repo is a working Next.js web tester, not yet the requested full backend platform. It compiles and passes lint/build, but the production beta architecture is still missing NestJS, Prisma, PostgreSQL, Redis, BullMQ, WebSockets, CI/CD, Sentry, Swagger, Playwright, and a real tenant-scoped backend.

The requested target architecture is valid for a 7-day beta plan, but it must be introduced in controlled phases after the Prisma schema is approved by the human founder.

Day 1 additions:

- `prisma/schema.prisma` created as [AWAITING_HUMAN_APPROVAL].
- `.env.example` expanded with beta variables.
- `docker-compose.yml` created for local Postgres, Redis, and app services.
- Governance docs created for agent ownership, locks, AI governance, and stable beta criteria.

## Confirmed Current Stack

- Next.js 15.1.3 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS
- Zustand with localStorage persistence
- shadcn-like local UI primitives
- Recharts
- Lucide icons
- Next API routes for auth and Telegram test/status
- Middleware-protected routes for `/admin/*` and `/driver/*`
- Local mock data and local demo state

## Requested Target Stack

Target stack for beta, not yet implemented:

- Next.js frontend
- NestJS backend
- Prisma ORM
- PostgreSQL
- Redis
- Socket.IO WebSockets with Redis adapter
- BullMQ event queue
- JWT + refresh tokens
- Swagger API docs
- Sentry + structured logs
- Playwright critical path tests
- GitHub Actions CI gate

## Stack Gap

| Capability | Current State | Target State | Risk |
| --- | --- | --- | --- |
| Frontend | Next.js working | Keep Next.js | Low |
| Backend | Next API routes only | NestJS API under `/api/v1` | High migration scope |
| Database | None | PostgreSQL + Prisma | High, needs schema approval |
| Tenant isolation | Mock/local guard only | Tenant-scoped Prisma middleware + DB policy | High |
| RBAC | Admin/driver in auth, CMS roles in UI model | 5 beta roles stored in DB | Medium |
| Realtime | None | Socket.IO + Redis adapter | Medium |
| Events | Local timeline only | BullMQ event bus | Medium |
| GPS | Simulated browser state | Redis current position, event-only Postgres | Medium |
| Maps | Google provider-ready + local fallback | MapLibre default, Google optional | Medium |
| Tests | Lint/build only | Playwright + backend tests | Medium |
| CI/CD | Not detected | GitHub Actions | Medium |
| Observability | Not detected | Sentry + Pino + `/health` | Medium |

## Existing Routes

Public:

- `/`
- `/login`
- `/track/demo`
- `/cms` redirects/shortcuts to admin CMS

Admin:

- `/admin`
- `/admin/cms`
- `/admin/routes`
- `/admin/kpis`
- `/admin/settings`

Driver:

- `/driver`
- `/driver/route`

API routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/cms/telegram/status`
- `POST /api/cms/telegram/test`

Local infrastructure files:

- `docker-compose.yml`: Postgres, Redis, app service.
- `prisma/schema.prisma`: proposed schema only, no migration run.

## Existing Modules And State

| Module | Files | Current State |
| --- | --- | --- |
| Auth demo | `src/app/api/auth/*`, `src/lib/serverAuth.ts`, `src/lib/sessionToken.ts`, `src/middleware.ts` | Functional HTTP-only cookie auth for admin/driver only |
| Admin dashboard | `src/components/admin/AdminDashboard.tsx` | Operational KPI demo, local state |
| CMS beta | `src/components/admin/AdminCms.tsx`, `src/components/admin/CmsEnterpriseOverview.tsx` | Functional local CMS shell with tenants/users/routes/drivers/incidents/audit/approvals/sandbox |
| RBAC model | `src/modules/cms/types.ts`, `src/services/permissions/rbac.ts` | UI/service-level model only, not database-backed |
| Audit logs | `src/services/audit/auditLog.ts` | Local immutable-looking log entries only |
| Tenant model | `src/services/tenant/tenantService.ts` | Local tenant operations only |
| Driver portal | `src/components/driver/*` | Functional local demo |
| Customer tracking | `src/components/customer/*` | Functional local/Google-ready demo |
| Maps | `src/components/customer/FleetTrackingMap.tsx`, `src/lib/demoMapCoordinates.ts` | Google Maps JS optional, local fallback stable |
| Telegram | `src/app/api/cms/telegram/*` | Env detection + test notification if configured |
| Data/KPI/ETA | `src/data/mockData.ts`, `src/lib/*Calculations.ts` | Pure local calculations, no persistence |

## What Is Broken Or Incomplete

No P0 compile blocker was found during this audit.

Current build status:

- `npm run lint`: passed
- `npm run build`: passed

Functional gaps:

- No real backend service boundary.
- No real database, migrations, or Prisma client.
- No real JWT refresh-token auth.
- No beta 5-role RBAC in database.
- No hard tenant isolation in persistence.
- No `/api/v1` versioned API layer.
- No WebSocket server or Redis adapter.
- No BullMQ event system.
- No MapLibre integration yet.
- No Playwright tests.
- No CI/CD workflow detected.
- No `/health` endpoint.
- No Sentry/Pino observability.
- No Swagger/OpenAPI docs.

## Dependencies Missing For Target Beta

Backend and data:

- `@nestjs/core`
- `@nestjs/common`
- `@nestjs/platform-express`
- `@nestjs/platform-socket.io`
- `@nestjs/swagger`
- `@prisma/client`
- `prisma`
- `pg`
- `redis` or `ioredis`
- `socket.io`
- `@socket.io/redis-adapter`
- `bullmq`
- `jsonwebtoken` or Nest JWT package
- `bcrypt` or `argon2`
- `pino`
- `@sentry/nextjs` and/or Nest Sentry integration

Testing/CI:

- `@playwright/test`
- GitHub Actions workflow

Maps:

- `maplibre-gl`
- optional Google Maps API key only via env

## Env Vars Current

Defined in `.env.example`:

- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `OPENROUTESERVICE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Env Vars Missing For Target Beta

Required for backend beta:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ROUTEPULSE_DEMO_SECRET`
- `SENTRY_DSN`
- `APP_BASE_URL`
- `CUSTOMER_TRACKING_TOKEN_SECRET`
- `DEMO_RESET_CRON_SECRET`

## Bounded Contexts For Beta

- Auth: login, refresh token, session, role check.
- Tenancy: tenant scope, module config, cross-tenant prevention.
- Fleet: drivers, vehicles, current position.
- Operations: routes, stops, approvals, dispatcher workflow.
- Tracking: customer magic-token tracking and driver movement.
- Incidents: mobile incident intake and dispatcher visibility.
- Audit: immutable audit logs for critical actions.
- Demo Sandbox: isolated demo tenant, resettable seed data.

## Git / Branch State

This workspace was initialized as a local Git repository during Day 1 with an empty initial commit.

Project files remain uncommitted intentionally to avoid a large accidental first commit before CEO review. A remote is not configured yet.

Requested branch structure:

- `main`
- `develop`
- `staging`
- `agent/fullstack-core`
- `agent/qa-stability`
- `agent/demo-experience`
- `agent/docs`

## Architectural Decision

Do not migrate immediately. First lock the Prisma schema draft in `docs/CURRENT_DECISIONS.md` and wait for human approval.
