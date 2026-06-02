# Operational Audit

Generated: 2026-06-01
Audit role: Operational Auditor Agent

## Verdict

RouteTrust can demonstrate last-mile operational concepts locally. It cannot run a real logistics operation today.

The strongest operational areas are route simulation, driver workflow, customer ETA display, KPI calculations, incidents and bug intake. The weakest areas are real dispatch data, real driver telemetry, DB persistence, customer account tracking, approvals as durable workflow, reports and tenant isolation.

## Module Classification

| Module | Classification | Evidence | Blocking gap |
|---|---|---|---|
| Routes | DEMO_OPERATIONAL | `src/data/mockData.ts`, `src/store/routePulseStore.ts` | No persisted route API or DB lifecycle |
| Drivers | DEMO_OPERATIONAL | driver portal and local assigned route | No real driver identity, mobile sync or telemetry |
| Deliveries | DEMO_OPERATIONAL | package status progression in Zustand | No durable delivery event ledger |
| Incidents | DEMO_OPERATIONAL | local incident actions in store | No server persistence except bug reports |
| ETA | DEMO_OPERATIONAL | pure ETA calculations and tests | No real traffic, GPS, carrier or historical model |
| SLA | DEMO_OPERATIONAL | KPI projection functions | No contractual SLA records or reporting |
| Customer tracking | DEMO_OPERATIONAL | `/track/demo`, simulated projection | Public demo only, no lookup by real order |
| Dashboard operativo | DEMO_OPERATIONAL | admin dashboard reads local state | No backend source of truth |
| Business manager experience | DEMO_OPERATIONAL | dashboard, CMS surfaces | Good demo; not enterprise workflow |
| Approval workflow | DOCUMENTATION_ONLY / DEMO_OPERATIONAL | seed approval requests | No durable approval API |
| KPIs | DEMO_OPERATIONAL | pure KPI calculations | Calculated from mock/local state |
| Reportes | MISSING | no real reporting/export pipeline | Required for B2B ops |
| Trazabilidad | PARTIAL | local audit JSON for bug/Telegram events | Not complete operational audit trail |
| Real data vs mocks | MOCK_ONLY dominant | hardcoded tenants, routes, users, stops | Must migrate to DB |

## What Real Operation Can Run Today

- Local admin can view a convincing control tower.
- Local driver can start/pause/resume/complete/fail demo stops.
- Local customer can view simulated ETA and privacy-safe stop summary.
- Local admin can create and triage bug reports into durable JSON files.
- Local health and status pages can show operational truth for the developer machine.

## What Is Simulated

- Driver movement.
- Route progress.
- Traffic factor.
- ETA recalculation.
- SLA projection.
- Tenant metrics.
- CMS content state.
- Approval requests.
- Telegram integration when env is absent.

## What Is Hardcoded

- Demo users in `src/data/testUsersDb.ts`.
- Demo tenants in `src/services/tenant/tenantService.ts`.
- CMS users, drivers, incidents, approvals and suggested routes in `src/services/cms/cmsService.ts`.
- Demo route and customer data in `src/data/mockData.ts`.
- Tenant authorization allowlist in `src/services/cms/serverGuards.ts`.

## What Requires Backend Real

- Route creation, assignment and status changes.
- Driver state and telemetry.
- Delivery event ledger.
- Customer tracking lookup.
- Incident lifecycle.
- Approval workflow.
- Tenant onboarding and module configuration.
- KPI snapshots and report exports.

## What Requires DB

Everything that must survive reloads, multi-user access or audit:

- users
- tenants
- roles and permissions
- routes
- stops
- drivers
- incidents
- approvals
- delivery events
- audit logs
- bug reports
- settings
- reports

## What Blocks Real Company Implementation

- No production identity.
- No DB-backed tenant isolation.
- No real route API.
- No migration history.
- No staging deployment.
- No real maps/traffic provider configured.
- No operational event ledger.
- No customer onboarding path.
- No support process beyond local bug JSON.

## Sellable Today

Sellable as paid discovery, prototype, or controlled demo build for logistics operators.

Not sellable as operational SaaS.

## Dangerous To Sell Today

- Any claim of production dispatch.
- Any claim of enterprise tenant isolation.
- Any claim of live tracking.
- Any claim of autonomous AI agents.
- Any claim of beta stable.
- Any claim that customer data can be onboarded safely.
