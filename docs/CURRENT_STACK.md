# Current Stack

Date: 2026-05-30

## Application

- Next.js 15.1.3 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS 3
- Zustand for local state
- Recharts 2 for charts
- Lucide React for icons

## Backend Shape

- API routes live in `src/app/api`.
- CMS Telegram status/test endpoints exist.
- Auth is implemented with route handlers plus HTTP-only cookie helpers.
- No separate NestJS/backend package exists yet.

## Data Layer

- Prisma 6 schema exists for Tenant, User, Driver, Route, RouteStop and AuditLog.
- PostgreSQL is the intended database via `DATABASE_URL`.
- Seed script creates demo tenant, users, driver and routes.
- Much of the current UI still uses local mock data and client store state.

## Infrastructure

- `docker-compose.yml` defines Postgres 15 and Redis 7.
- Docker CLI is not available on this PC yet.
- No CI workflow was restored from ZIP; a GitHub Actions workflow is being added.

## Validation Gates

- `lint`: passed
- `typecheck`: passed after seed type fix
- `build`: passed
- `test`: no test script exists yet
- `dev smoke`: key pages returned 200
