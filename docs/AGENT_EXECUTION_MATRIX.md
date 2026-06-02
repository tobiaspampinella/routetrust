# Agent Execution Matrix

| Agent | Runs when | Skips when | Can touch | Must not touch | Deliverable |
| --- | --- | --- | --- | --- | --- |
| `codex-node` | General drift, blockers, ACTIVE_TASKS drift, P0/P1, handoff drift | No real signal or still cooling down | `docs/`, `runtime/`, `scripts/` | `src/`, `prisma/` | Status report and next action |
| `devops-automation-agent` | Runtime, build, health or GitHub drift | No ops signal or cooldown | `docs/`, `runtime/`, `.github/`, `scripts/` | product source | Ops doctor report |
| `qa-analyst-agent` | Regression evidence, beta drift, smoke or beta fail | No QA signal or cooldown | `docs/`, `tests/`, `runtime/` | product source | QA evidence and bug priority |
| `web-tester-agent` | 10:00 or 22:00 slot, assigned smoke work, browser P0 | Outside slot, no P0 and no assigned smoke work, or cooldown | `tests/`, `playwright-report/`, `docs/`, `runtime/` | product source | Browser smoke report and screenshots |
| `backend-developer-agent` | Assigned backend P0/P1, backend bug, auth/API/DB failure | No assigned work, conflicting lock, manual requirement or cooldown | `src/app/api/`, `src/services/`, `src/lib/`, `prisma/`, `docs/`, `runtime/` | frontend UI files | Backend audit or fix report |
| `frontend-developer-agent` | Assigned frontend P0/P1, visual regression, landing/CMS/demo/portal issue | No assigned work, conflicting lock or cooldown | `src/app/`, `src/components/`, `docs/`, `runtime/` | `prisma/`, backend API files | Frontend audit or fix report |
| `ui-ux-product-designer-agent` | Daily UX review or P1 UX-visible regression | No UX signal or cooldown | UX-facing docs and visible UI surfaces | backend, auth, DB | UX audit |
| `cybersecurity-engineer-agent` | Daily security review or P0/P1 security signal | No security signal or cooldown | security-related docs, routes and services | visual-only files | Security audit and release block note |
| `maps-tracking-agent` | Daily maps review or P1 tracking regression | No signal, cooldown or paid API decision pending | tracking docs, customer map components, shared libs | unrelated auth/backend files | Maps/tracking audit |
| `product-gtm-agent` | Tuesday, Friday or explicit GTM request | Outside GTM window or cooldown | `README.md`, landing copy, GTM docs | runtime, backend, auth files | GTM brief |

## Priority Rules

- P0: build broken, route 500, auth broken, critical bug, data loss, exposed secret, broken tenant isolation.
- P1: smoke failed, CMS broken, driver portal broken, customer tracking broken, assistant broken, GitHub CI broken.
- P2: UX improvements, copy, docs, maps premium, GTM and branding.

P0 can break cooldown. P1 can shorten cooldown. P2 respects full cooldown.
