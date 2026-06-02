# Issues

Status values: `open`, `in_progress`, `blocked`, `done`.

| ID | Severity | Area | Description | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| AUTH-001 | P1 | Auth | Security hardening in progress. Sensitive implementation details are tracked privately. | private security tracking | open |
| STORE-001 | P0 | Backend | Minimum durable storage now exists, but it is still file-based local persistence only. | `src/lib/storage/fileStore.ts` | in_progress |
| HEALTH-001 | P0 | Observability | `/api/health` now exists and must remain honest. | `src/app/api/health/route.ts` | in_progress |
| SMOKE-001 | P0 | QA | Browser smoke now exists and gates stable local beta. | `tests/e2e/smoke.spec.ts` | in_progress |
| STATUS-001 | P1 | Ops | Project status previously overstated automation; honesty must be preserved. | `src/app/admin/project-status/page.tsx` | in_progress |
| STAGING-001 | P2 | DevOps | No deployment URL or remote staging baseline exists. | runtime/project status and docs | open |
