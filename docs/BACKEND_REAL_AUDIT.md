# Backend Real Audit

Generated: 2026-06-01
Audit role: Backend Real Auditor Agent

## Verdict

There is a real Next.js API surface, but only a small part behaves like backend. The only meaningful durable backend pieces are bug reports, bug dispatches, audit events, project events and health checks, all persisted to local JSON files. The core logistics backend is still demo/local-state.

## Endpoint Table

| Endpoint | Real/Demo/Mock | Auth | Persistencia | Riesgo | Server-ready |
|---|---|---|---|---|---|
| `GET /api/health` | Real local health | none | reads/ensures local JSON | Low for local, insufficient for SaaS | Partial |
| `POST /api/auth/login` | Demo backend | demo user hash | cookie only | Static users, no DB | No |
| `POST /api/auth/logout` | Demo backend | cookie clear | none | OK for demo | Partial |
| `GET /api/auth/me` | Demo backend | signed cookie | none | No real session store | No |
| `GET /api/bugs` | Real local backend | CMS view guard | `data/runtime/bug-reports.json` | Local FS, no tenant DB | No |
| `POST /api/bugs` | Real local backend | signed demo session | bug JSON + audit JSON | Local FS, no rate limit | No |
| `GET /api/bugs/[bugId]` | Real local backend | CMS view guard | bug JSON | No tenant scoping per record | No |
| `PATCH /api/bugs/[bugId]` | Real local backend | CMS update guard | bug JSON | Local FS race risk | No |
| `POST /api/bugs/[bugId]/route` | Real local backend | CMS assign guard | bug dispatch JSON | Route naming defect | No |
| `GET /api/agents` | Demo/status backend | none | reads runtime JSON | Exposes local runtime status | Partial local |
| `POST /api/assistant` | Demo/local assistant | optional session | creates bug JSON if ticket | Rules, not AI backend | No |
| `GET /api/cms/telegram/status` | Real local config check | CMS configure guard | audit JSON on missing config | Env-only, no secret exposure seen | Partial |
| `POST /api/cms/telegram/test` | Integration test endpoint | CMS configure guard | audit JSON | External send only if env exists | Partial |
| `GET /api/cms/telegram/project-intelligence` | Demo report endpoint | CMS view guard | none | Hardcoded report | No |
| `POST /api/cms/telegram/project-intelligence` | Demo/integration endpoint | CMS configure guard | none | Hardcoded report; external send | Partial |

## Does Real Backend Exist?

Yes, but only for a local beta support layer. It is not the backend needed for SaaS logistics operations.

## Real APIs

- `api/health`
- `api/bugs`
- `api/bugs/[bugId]`
- `api/bugs/[bugId]/route`
- Telegram status/test in the limited sense of env check and optional send

These are real because they execute server-side and persist or inspect runtime state.

## Demo APIs

- auth login/me/logout
- assistant
- agents
- project-intelligence

These support the demo and local orchestration, not production operations.

## Mock APIs

There are no route/driver/tenant/CMS CRUD APIs. CMS state is seeded in code and client-local.

## APIs Without Production Persistence

All existing APIs lack production persistence. Bug and audit storage are durable only on the local filesystem.

## APIs Not Server-Ready

Everything that writes to `data/runtime` is not serverless-ready and is weak for container deployments. It must move to DB.

## Must Be Rebuilt

- auth
- users
- sessions
- tenants
- RBAC
- routes
- stops
- drivers
- incidents
- approvals
- tracking lookup
- audit logs

## Can Be Kept

- Pure KPI/ETA calculation logic, after adding DB-backed inputs.
- Bug report shape and routing concepts.
- Health endpoint concept.
- Session cookie guard concept, after real auth replacement.
- Telegram env-check pattern, after secrets and notification design are productionized.
