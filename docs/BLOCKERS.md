# Blockers

## P0

| ID | Severity | Status | Owner | Evidence | Next action |
| --- | --- | --- | --- | --- | --- |
| HEALTH-001 | P0 | open | Backend | `/api/health` must stay 200 and honest | Keep health in beta-check and smoke |
| SMOKE-001 | P0 | open | QA | Browser smoke is required for stable local beta | Keep `qa:smoke` green on each cycle |
| STORE-001 | P0 | open | Backend | Durable runtime storage is the minimum persistence baseline | Verify JSON stores survive restart |

## P1

| ID | Severity | Status | Owner | Evidence | Next action |
| --- | --- | --- | --- | --- | --- |
| STATUS-001 | P1 | open | Ops | Project status was overstating automation | Keep dashboard tied to real checks |
| CHURN-001 | P1 | open | Ops | Runtime churn polluted git history | Keep runtime files ignored and out of versioned docs |
| AUTH-001 | P1 | open | Security | Demo secret fallback still exists | Remove silent fallback before claiming stable |
| TENANT-001 | P1 | open | Backend | Tenant isolation remains beta-grade | Centralize tenant context before staging |

## P2

| ID | Severity | Status | Owner | Evidence | Next action |
| --- | --- | --- | --- | --- | --- |
| TELEGRAM-001 | P2 | open | Integrations | Telegram is optional and unconfigured | Leave optional or configure explicitly |
| MAPS-001 | P2 | open | Maps | Maps are still fallback-only | Decide provider only after stable local beta |
| STAGING-001 | P2 | open | DevOps | No deployment URL exists | Create remote staging baseline |
