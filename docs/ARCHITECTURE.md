# Architecture - Beta SaaS Controlada v0.1

## Current Runtime

- Framework: Next.js App Router.
- Language: TypeScript.
- UI: React, Tailwind CSS, local UI primitives, lucide-react, Recharts.
- State: Zustand with localStorage persistence for most demo/product state.
- API: Next API routes under `src/app/api`.
- Data model: Prisma schema exists, but primary product flows still use mock/local state.
- Auth: demo HTTP-only cookie session with local test users and middleware protection.

## Product Boundaries

RoutePulse SaaS Beta is a controlled beta for logistics operations. It is not yet a full TMS, ERP, billing platform or enterprise-grade multi-tenant backend.

Current bounded contexts:

- Auth and session.
- Admin dashboard.
- CMS beta.
- Driver portal.
- Customer tracking demo.
- ETA/KPI simulation.
- Bug intake.
- Telegram status/test/project-intelligence endpoints.
- Tenant/RBAC/audit models as local beta services.

## Data Reality

Production persistence is not complete.

- Local state: routes, packages, settings, tracking CMS, incidents, tenant/CMS UI state.
- In-memory API state: bug reports.
- Prisma: schema draft exists for Tenant/User/Driver/Route/RouteStop/AuditLog.
- Missing persisted modules: bug reports, audit logs, approvals, incidents, tenant module config, route events, customer tracking events.

## Security Reality

- Admin and driver routes are middleware-protected.
- CMS API guards exist.
- Tenant isolation is hardcoded/demo-scoped, not database-enforced.
- Auth is not production-grade.
- Current production dependency audit reports a critical Next.js advisory.

## Target Incremental Architecture

1. Keep one Next.js app while beta scope is small.
2. Persist the smallest critical module first: bug reports.
3. Add tenant resolution helper before expanding APIs.
4. Harden auth without introducing an enterprise identity system.
5. Add `/api/health` and structured operational status.
6. Move audit logs and incidents into Prisma after bug reports.

## Non-goals For This Cycle

- Billing.
- Telegram webhook.
- Microservices.
- Advanced AI.
- Native mobile apps.
- Full enterprise RBAC.
