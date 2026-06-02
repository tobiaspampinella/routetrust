# Agent Schedule

RouteTrust uses local scripts, scheduled audits and explicit handoffs. It does not run autonomous LLM workers.

## Base Frequency

| Agent | Frequency | Cooldown | Mode | Immediate triggers |
| --- | --- | ---: | --- | --- |
| `codex-node` | Every 2 hours | 90 min | Coordination and reporting only | P0, P1, blocker drift, handoff drift |
| `devops-automation-agent` | Every 4 hours | 3 hours | Runtime, build, GitHub, health | Build fail, beta fail, infra drift |
| `qa-analyst-agent` | Every 6 hours | 4 hours | Beta and regression validation | Smoke fail, beta fail, regression signal |
| `web-tester-agent` | 10:00 and 22:00 local | 8 hours | Playwright/browser smoke only | P0 browser-facing breakage |
| `backend-developer-agent` | On demand or every 8 hours with assigned P0/P1 | 6 hours | API, DB, auth, CMS backend | P0/P1 backend bug or backend check fail |
| `frontend-developer-agent` | On demand or every 8 hours with assigned P0/P1 | 6 hours | Landing, CMS UI, demo, driver, customer UI | P0/P1 UI bug or visual check fail |
| `ui-ux-product-designer-agent` | Daily | 20 hours | UX audit only | P1 UX-visible regression |
| `cybersecurity-engineer-agent` | Daily | 20 hours | Security audit only | P0/P1 auth, secret or tenant risk |
| `maps-tracking-agent` | Daily | 20 hours | Maps and tracking audit only | P1 tracking or maps regression |
| `product-gtm-agent` | Tuesday and Friday | 72 hours | GTM and messaging review only | Explicit manual GTM request |

## Gating

Before any agent is dispatched, RouteTrust checks:

1. Git changed since the last real execution for that agent.
2. Open tasks exist for that agent.
3. P0 or P1 bugs are assigned or clearly related.
4. A related health, build, beta or smoke check failed.
5. The scheduled interval or fixed time window was reached.
6. Cooldown is still active.
7. Another task owns conflicting locked files.
8. The work still requires human intervention.

If the signal is not real, the agent is skipped.

## Skip Codes

- `SKIPPED_NO_CHANGES`
- `SKIPPED_COOLDOWN`
- `SKIPPED_NO_TASKS`
- `SKIPPED_BLOCKED`
- `SKIPPED_MANUAL_REQUIRED`

## Noise Exclusions

These files do not count as meaningful change by themselves:

- `runtime/heartbeats/`
- `runtime/logs/`
- `runtime/reports/`
- `docs/agent-reports/`
- `runtime/agent-budget.json`
- `runtime/agent-last-run.json`
- `runtime/project-status.json`
- `runtime/watchdog-state.json`
- `docs/AGENT_RUNTIME_STATUS.md`
- `docs/DAILY_CONTROL_REPORT.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `NEXT_AGENT_PROMPT.md`

## Start Commands

- `npm run agent:scheduler`
- `npm run agent:runner`
- `npm run watchdog`
- `npm run ops:daily-summary`

## Manual Boundaries

- Product code changes still require explicit assignment.
- Paid map providers remain off without env plus human approval.
- Release decisions, external credentials and host-level fixes remain manual.
