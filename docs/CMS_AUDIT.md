# CMS Audit - RoutePulse AI

Date: 2026-05-27
Agent: Principal AI Node Orchestrator
Status: Day 1 audit completed

## Audit Result

The current repo is a functional Next.js web tester with local state. It is not yet the requested full backend platform. The CMS has useful beta UI, mock tenants/users/routes/drivers/incidents/audit/sandbox, and protected admin routes, but it does not yet have real persistence, API versioning, database-backed RBAC, tenant middleware, WebSockets, Redis, BullMQ, or Playwright tests.

Last validation before this Day 1 cycle:

- `npm run lint`: passed
- `npm run build`: passed

## Confirmed Stack

- Next.js 15.1.3 App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand/localStorage
- Next API routes
- Next middleware
- Local mock data
- Optional Google Maps JavaScript API provider readiness
- Local tracking fallback

## Target Stack Not Yet Implemented

- NestJS
- Prisma Client runtime
- PostgreSQL persistence
- Redis
- Socket.IO with Redis adapter
- BullMQ
- JWT access/refresh token backend
- Swagger
- Sentry/Pino
- Playwright
- GitHub Actions

## File Inventory And Purpose

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Project agent rules and product guardrails. |
| `CHANGELOG.md` | Human-readable product/change history. |
| `NEXT_AGENT_PROMPT.md` | Handoff prompt for the next agent cycle. |
| `README.md` | Project overview, setup, demo users, current limitations. |
| `SOFTWARE_LOG.md` | Internal software evolution log. |
| `.env.example` | Required environment variable template. |
| `.eslintrc.json` | ESLint compatibility config for Next lint. |
| `.gitignore` | Git ignore rules for local/build/secret files. |
| `docker-compose.yml` | Local Postgres/Redis/app foundation for future backend beta. |
| `next-env.d.ts` | Next.js generated TypeScript environment declarations. |
| `next.config.ts` | Next.js config. |
| `package.json` | Scripts and dependencies. |
| `postcss.config.mjs` | PostCSS/Tailwind pipeline config. |
| `tailwind.config.ts` | Tailwind theme/content config. |
| `tsconfig.json` | TypeScript compiler config. |
| `prisma/schema.prisma` | Proposed beta data model, awaiting human approval. |
| `docs/ACTIVE_TASKS.md` | Active task board for agents. |
| `docs/AGENT_OWNERSHIP.md` | Module ownership by agent role. |
| `docs/AI_GOVERNANCE.md` | AI/human approval governance. |
| `docs/BETA_BUILD_PLAN.md` | 7-day build plan. |
| `docs/BETA_STABLE_CRITERIA.md` | 25-point beta stability checklist. |
| `docs/CMS_AUDIT.md` | This audit. |
| `docs/CMS_IMPLEMENTATION_PLAN.md` | Prior CMS implementation plan. |
| `docs/CMS_SPEC.md` | Prior CMS spec. |
| `docs/CURRENT_ARCHITECTURE.md` | Current architecture and gaps. |
| `docs/CURRENT_DECISIONS.md` | Current locked decisions and schema approval gate. |
| `docs/DEMO_SANDBOX_SPEC.md` | Demo sandbox spec. |
| `docs/LOCKED_FILES.md` | File lock governance. |
| `docs/PRISMA_SCHEMA_DRAFT.prisma` | Pointer to canonical schema. |
| `src/middleware.ts` | Protects `/admin/*`, `/driver/*`, and login redirects. |
| `src/app/layout.tsx` | Root app layout and metadata. |
| `src/app/globals.css` | Global styles and tracking-map CSS. |
| `src/app/page.tsx` | Public landing entry. |
| `src/app/login/page.tsx` | Login UI. |
| `src/app/cms/page.tsx` | Shortcut route to admin CMS. |
| `src/app/track/demo/page.tsx` | Public customer tracking demo route. |
| `src/app/admin/page.tsx` | Admin dashboard page. |
| `src/app/admin/cms/page.tsx` | Admin CMS page. |
| `src/app/admin/kpis/page.tsx` | Admin KPI page. |
| `src/app/admin/routes/page.tsx` | Admin route page. |
| `src/app/admin/settings/page.tsx` | Admin settings page. |
| `src/app/driver/page.tsx` | Driver home page. |
| `src/app/driver/route/page.tsx` | Driver route page. |
| `src/app/api/auth/login/route.ts` | Demo login endpoint. |
| `src/app/api/auth/logout/route.ts` | Demo logout endpoint. |
| `src/app/api/auth/me/route.ts` | Current session endpoint. |
| `src/app/api/cms/telegram/status/route.ts` | Telegram env status endpoint. |
| `src/app/api/cms/telegram/test/route.ts` | Telegram test notification endpoint. |
| `src/components/admin/AdminShell.tsx` | Admin navigation shell. |
| `src/components/admin/AdminDashboard.tsx` | Operational dashboard UI. |
| `src/components/admin/AdminCms.tsx` | CMS tab shell and demo builder. |
| `src/components/admin/CmsEnterpriseOverview.tsx` | Main local CMS beta console. |
| `src/components/admin/LiveCmsTab.tsx` | Live ops mock actions. |
| `src/components/admin/AdminKpis.tsx` | KPI visualizations. |
| `src/components/admin/AdminRoutes.tsx` | Route list/detail UI. |
| `src/components/admin/AdminSettings.tsx` | Mock system settings UI. |
| `src/components/customer/CustomerTrackingDemo.tsx` | Customer tracking page experience. |
| `src/components/customer/FleetTrackingMap.tsx` | Provider-ready tracking map/fallback. |
| `src/components/customer/CustomerTrackingMap3D.tsx` | Older 3D-style customer map component. |
| `src/components/customer/DriverMap.tsx` | Driver/customer map helper. |
| `src/components/driver/DriverShell.tsx` | Driver portal shell. |
| `src/components/driver/DriverHome.tsx` | Driver route summary. |
| `src/components/driver/DriverRoute.tsx` | Driver route workflow actions. |
| `src/components/shared/CxAssistantWidget.tsx` | Local CX bug/report assistant. |
| `src/components/shared/LandingPage.tsx` | Public landing page. |
| `src/components/shared/PageHeader.tsx` | Shared page header. |
| `src/components/shared/RouteMapPlaceholder.tsx` | Placeholder map component. |
| `src/components/shared/StatCard.tsx` | Shared KPI card. |
| `src/components/shared/StatusBadge.tsx` | Shared status badge. |
| `src/components/shared/VersionFooter.tsx` | Version footer. |
| `src/components/shared/status-labels.ts` | Status label helpers. |
| `src/components/ui/badge.tsx` | UI badge primitive. |
| `src/components/ui/button.tsx` | UI button primitive. |
| `src/components/ui/card.tsx` | UI card primitive. |
| `src/components/ui/input.tsx` | UI input primitive. |
| `src/components/ui/label.tsx` | UI label primitive. |
| `src/components/ui/modal.tsx` | UI modal primitive. |
| `src/components/ui/progress.tsx` | UI progress primitive. |
| `src/data/mockData.ts` | RoutePulse demo data. |
| `src/data/testUsersDb.ts` | Local test users and password hashes. |
| `src/lib/demoMapCoordinates.ts` | Buenos Aires demo coordinates. |
| `src/lib/etaCalculations.ts` | Pure ETA calculations. |
| `src/lib/kpiCalculations.ts` | Pure KPI calculations. |
| `src/lib/operationalInsights.ts` | Rule-based operational insights. |
| `src/lib/serverAuth.ts` | Demo auth password validation. |
| `src/lib/sessionToken.ts` | Demo signed session cookie helpers. |
| `src/lib/trackingSimulation.ts` | Customer tracking simulation helpers. |
| `src/lib/types.ts` | Shared TypeScript domain types. |
| `src/lib/utils.ts` | Shared className utility. |
| `src/lib/version.ts` | Visible app version metadata. |
| `src/modules/cms/types.ts` | CMS domain types. |
| `src/services/audit/auditLog.ts` | Local audit log helpers. |
| `src/services/cms/cmsService.ts` | CMS seed/default services. |
| `src/services/cms/serverGuards.ts` | Server-side CMS permission guards. |
| `src/services/permissions/rbac.ts` | Local RBAC helpers. |
| `src/services/tenant/tenantService.ts` | Local tenant helpers. |
| `src/store/routePulseStore.ts` | Zustand global app state. |

## Broken Imports Or Missing Dependencies

No broken imports were detected in the current source during the last successful lint/build.

Current imports are covered by `package.json`:

- `next`
- `react`
- `react-dom`
- `zustand`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `class-variance-authority`
- `@radix-ui/react-*`
- `recharts`

Dependencies missing for the requested target architecture:

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
- `jsonwebtoken` or Nest JWT equivalent
- `bcrypt` or `argon2`
- `pino`
- `@sentry/nextjs`
- `@playwright/test`
- `maplibre-gl`

## Env Vars Referenced

Referenced in active source:

- `ROUTEPULSE_DEMO_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NODE_ENV`

Referenced by new proposed Prisma schema:

- `DATABASE_URL`

Referenced in docs/target beta:

- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_GOOGLE_MAP_ID`
- `NEXT_PUBLIC_OPENROUTE_API_KEY`
- `SENTRY_DSN`
- `APP_URL`
- `DEMO_MODE`

## Env Var Gaps Fixed In Day 1

`.env.example` now includes:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ROUTEPULSE_DEMO_SECRET`
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAP_ID`
- `NEXT_PUBLIC_OPENROUTE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SENTRY_DSN`
- `APP_URL`
- `DEMO_MODE`

## Current CMS Gaps

- CMS state is local/mock, not database-backed.
- CMS roles are richer in UI than beta backend target; backend beta will use 5 roles first.
- Existing admin/driver auth is demo-only and not true JWT refresh-token auth.
- Tenant isolation is modeled, but not enforced by database.
- Audit logs are local UI records only.
- Approval workflow is visible but not enforced by backend.
- Telegram settings are env-aware, but Telegram automation is deferred.
- Map provider fallback works, but MapLibre default is not implemented yet.

## Step 4 Git Audit

Initial audit found no Git repository:

`fatal: not a git repository (or any of the parent directories): .git`

Day 1 action:

- Initialized a local Git repo.
- Created empty initial commit only.
- Created branches:
  - `main`
  - `develop`
  - `staging`
  - `agent/fullstack-core`
  - `agent/qa-stability`
  - `agent/demo-experience`
  - `agent/docs`

Risk:

- No remote is configured yet.
- Project files are not committed yet; this avoids accidental bulk commit before CEO review.

## Migration Blocker

Prisma migration start is blocked by human approval of:

- `prisma/schema.prisma`
- tenant strategy
- RBAC model
- Redis GPS storage decision
- approval/audit state machine

## Cycle 0 Local Run Audit - 2026-05-27

Goal:

- Get the project running locally with minimum changes.
- Do not add product features.

Findings:

- The repo currently contains a Next.js 15.1.3 app, not Next.js 14.
- NestJS backend does not exist yet.
- There is one project `package.json`; no separate backend package exists.
- Before this cycle there was no local `node_modules` or `package-lock.json` inside `routepulse-ai-tester`; npm resolves workspace packages from the parent directory.
- Active source imports are covered after dependency installation; no missing import package remains.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `npx prisma validate` passes after downgrading Prisma from 7 to 6.

Dependencies added:

- `@prisma/client@6`
- `prisma@6`
- `bcryptjs`
- `tsx`

Why Prisma 6:

- Prisma 7 rejected the requested classic `datasource db { url = env("DATABASE_URL") }` schema format.
- Cycle 0 explicitly requires `npx prisma generate` and `npx prisma migrate dev --name init`, which works with Prisma 6.

Files changed for local run:

- `prisma/schema.prisma` simplified to the Cycle 0 models only.
- `prisma/seed.ts` created with Demo Company seed data.
- `.env.example` completed.
- `.env` and `.env.local` created locally and are gitignored.
- `docker-compose.yml` replaced with Postgres 15 + Redis 7 per Cycle 0 instructions.
- `package.json` updated with `typecheck` and Prisma seed command.

Runtime status:

- `npm run dev` starts in foreground without TypeScript errors.
- `npm run build` succeeds.
- `next start` serves `http://localhost:3000` with HTTP 200 after build.

Blocked:

- Docker was not installed.
- Docker CLI, Docker Compose, and Colima were installed via Homebrew.
- Colima required QEMU.
- QEMU began compiling from source on macOS 12 and was stopped because it was too slow for this local-run cycle.
- Therefore `docker compose up` cannot complete yet.
- PostgreSQL is not listening on port 5432.
- Redis is not listening on port 6379.
- `npx prisma migrate dev --name init` cannot reach `localhost:5432`.
- `npx prisma db seed` cannot reach `localhost:5432`.

Exact DB error:

`Can't reach database server at localhost:5432`

Security notes:

- `.env` and `.env.local` are ignored by Git.
- `.env.example` contains placeholders only.
- Demo seed contains only requested demo credentials, not production secrets.
