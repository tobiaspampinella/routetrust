# Backend Demo/Test Audit

Generated: 2026-06-01
Audit role: Backend DemoTest Auditor Agent

## Verdict

Demo/test/backend-local material dominates the app. Some of it is useful and should be preserved as seeded demo mode. None of it should be mistaken for production backend.

## Demo/Test Inventory

| Area | Location | Classification | Action |
|---|---|---|---|
| Demo users | `src/data/testUsersDb.ts` | useful for demo, dangerous for production | Gate behind `DEMO_MODE`; remove from prod auth |
| Demo route data | `src/data/mockData.ts` | useful for demo | Convert to seed data |
| Client store | `src/store/routePulseStore.ts` | useful demo state | Replace business truth with API/DB |
| LocalStorage persist | Zustand `persist` | dangerous for staging/prod | Only UI prefs may remain client-local |
| CMS seed state | `src/services/cms/cmsService.ts` | useful for demo | Convert to DB seed/migrations |
| Tenants seed | `src/services/tenant/tenantService.ts` | useful for demo | Replace with tenant table |
| RBAC matrix | `src/services/permissions/rbac.ts` | migrable | Persist role policies |
| File store | `src/lib/storage/fileStore.ts` | useful local beta | Replace with DB for server |
| Runtime reports | `runtime/*.json` | local ops only | Do not deploy as product data |
| Project status | `scripts/project-status` | useful local auditor | Keep as dev/ops tool |
| Telegram config | env-only | partial integration | Keep guarded; no secrets in output |
| Map provider copy | `mockData`, components | demo/fallback | Mark exact provider state in UI |

## Useful For Demo

- Mock logistics data.
- Route simulation engine.
- Local bug reports.
- Local project status.
- Driver/customer/admin flows.
- Demo sandbox state.

## Dangerous For Staging

- Static demo auth.
- LocalStorage as business state.
- Filesystem JSON as product persistence.
- Hardcoded tenant allowlist.
- Hardcoded operational dates and business metrics.
- Claims of Google Maps readiness when only env placeholder exists.

## Dangerous For Production

- All demo credentials.
- Any customer-like names, phones and addresses if presented as real data.
- Unscoped local JSON files.
- Lack of DB tenant checks.
- Lack of rate limits.
- Lack of migration/backup strategy.

## Migrable To DB

- bug reports
- audit events
- tenants
- CMS users
- approval policies
- approval requests
- drivers
- routes
- stops
- incidents
- dispatch records
- project events

## Must Be Eliminated Or Strictly Marked

- `testUsersDb` as auth backend.
- `mockReassignRoute` naming and behavior outside demo mode.
- Any production path depending on `localStorage`.
- Any server path depending on `data/runtime` for business data.

## DEMO_MODE Contract Required

`DEMO_MODE=true` should:

- allow static demo users
- allow seed mock data
- allow local JSON files
- show explicit demo labels
- block production claims

`DEMO_MODE=false` should:

- fail startup without auth secret and DB
- block test users
- block local JSON business writes
- require tenant-scoped DB queries
