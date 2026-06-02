# Project Execution Plan

Generated: 2026-06-01
Audit role: Project Manager Agent

## Priority Definitions

- P0: blocks server/stable truth.
- P1: blocks SaaS beta.
- P2: improves sellable product.
- P3: growth/GTM.

## P0 Tasks

| Task | Owner | Dependency | Effort | Impact | Deadline | Acceptance |
|---|---|---|---|---|---|---|
| Clean or isolate dirty Git tree | GitHub | audit docs complete | M | unblocks stable validation | Day 1 | `git status` clean or intentional branch diff documented |
| Fix flaky admin smoke | QA + Backend | auth/session review | M | beta confidence | Day 1 | 3 consecutive clean smoke runs |
| Remove duplicate bug route defect | Backend | route audit | S | routing hygiene | Day 1 | build no longer shows `/api/bugs/[bugId]/route` as accidental 0 B unless intentionally documented |
| Production env contract | DevOps + CISO | env review | M | server truth | Day 2 | health fails/degrades precisely and docs list required env |
| Prisma validate with DB env | Backend | local/test DB | M | DB readiness | Day 2 | `npx prisma validate` passes with configured `DATABASE_URL` |

## P1 Tasks

| Task | Owner | Dependency | Effort | Impact | Deadline | Acceptance |
|---|---|---|---|---|---|---|
| DB-backed users/tenants | Backend | Prisma baseline | L | SaaS foundation | Week 1 | users and tenants read from DB |
| DB-backed routes/stops/drivers | Backend | tenant model | L | operational backend | Week 2 | admin/driver routes use API data |
| Persist delivery events | Backend | route APIs | L | traceability | Week 2 | every driver action creates event |
| Real RBAC | Backend + CISO | users/roles | M | security | Week 2 | role permissions persisted and tested |
| Staging deploy | DevOps | DB + env | M | beta validation | Week 2 | `STAGING_URL` exists and smoke passes |
| Missing public routes | Frontend + Product | copy strategy | M | sales funnel | Week 2 | `/contact`, `/demo`, `/product`, `/use-cases`, `/customers`, `/pricing` exist or are removed from promises |

## P2 Tasks

| Task | Owner | Dependency | Effort | Impact | Deadline | Acceptance |
|---|---|---|---|---|---|---|
| Shared state components | Frontend + UX/UI | design system | M | product polish | Week 3 | Empty/Loading/Error used in core views |
| Bilingual UX system | UX/UI + Product | copy inventory | M | LatAm readiness | Week 3 | language behavior documented and implemented |
| Reports/export | Backend + Frontend | event ledger | M | manager value | Week 4 | daily close report export |
| Customer tracking token | Backend + Frontend | DB stops/orders | M | external UX | Week 4 | `/track/:token` works |

## P3 Tasks

| Task | Owner | Dependency | Effort | Impact | Deadline | Acceptance |
|---|---|---|---|---|---|---|
| Pricing page and ICP pages | CRO/GTM + Frontend | product claims locked | M | GTM | Month 2 | no false claims, clear packages |
| CRM/demo request integration | CRO/GTM + Backend | contact route | M | sales ops | Month 2 | lead captured safely |
| Advanced maps provider | Maps + DevOps | provider decision | L | product depth | Month 2 | legal/provider terms and key management complete |
