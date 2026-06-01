# Changelog

## 2026-06-01 - UX coordination and drivers surface pass

- Rewrote `README.md` and `README.es.md` to remove visible mojibake from the bilingual repo entry and align listed surfaces with current reality.
- Added `/admin/drivers` through `src/app/admin/drivers/page.tsx` and `src/components/admin/AdminDrivers.tsx`.
- Extended `src/components/admin/AdminShell.tsx` navigation to expose the new drivers surface.
- Hardened `scripts/ux-audit` mojibake detection and regenerated `docs/design/UX_AUDIT_REPORT.md` plus `.es.md`.
- Updated UX handoff prompts and marked active task `UXR-009` as done.

## 2026-06-01 - Scheduler relevance and daily-summary guard

- Hardened `scripts/agent-scheduling-lib.js` so generated runtime noise no longer counts as meaningful git drift for scheduled agent execution.
- Kept per-agent change evidence focused on relevant files instead of scheduler-authored reports and heartbeats.
- Fixed `scripts/agent-scheduler` so `ops:daily-summary` can only execute once per local day window instead of repeating within the same hour.
- Updated scheduler docs and handoff prompts to reflect the anti-token-burn model and the real local-script execution boundary.

## 2026-06-01 - Stable-gate honesty correction

- Hardened `scripts/beta-check` so `BETA_STABLE_READY` now requires `npm run build`, non-500 checks on `/admin`, `/admin/cms`, `/driver`, and `/driver/route`, and a clean Git worktree.
- Added dirty-worktree detection to block false stable claims when local checks are green but the candidate is not reviewable.
- Updated root and docs beta criteria so stable-local status no longer contradicts repository reality.
- Refreshed `NEXT_AGENT_PROMPT.md` to hand off the actual blocker: dirty Git state, not smoke/runtime health.

## 2026-06-01 - Smoke and beta-gate stabilization pass

- Reconfigured `playwright.config.ts` to use the installed system Edge binary on Windows instead of the blocked bundled headless shell.
- Disabled Playwright trace, screenshot and video artifacts for smoke so the suite no longer fails on `browserContext.close: spawn EPERM`.
- Hardened `scripts/beta-check` so runtime ownership falls back to the live RouteTrust health signal when process introspection is unreliable in the local sandbox.
- Removed the false dependency on broad runtime-missing validation from `LOCAL_DEMO_READY`, keeping the gate focused on stable-build criteria instead of unrelated runtime scaffolding.
- Revalidated `npm run qa:smoke`, `npm run beta-check` and `npm run project:status`; `BETA_STABLE_READY` is now true again while `STAGING_READY` remains false.

## 2026-06-01 - Scheduler anti-token-burn hardening

- Normalized the ten scheduled agent prompts with explicit role, limits, frequency, run/skip criteria, deliverable and file boundaries.
- Replaced `scripts/agent-budget` forced failure behavior with a real budget status report backed by `runtime/agent-budget.json`.
- Hardened `scripts/agent-scheduling-lib.js` so scheduled scripts inherit local bin PATH, bug matching includes assigned agent arrays, legacy task aliases map correctly and lock conflicts only block relevant code paths.
- Reworked `scripts/watchdog` into a cheaper supervisory check that retries health endpoints, marks P0-capable agents as eligible and deduplicates Telegram alerts through `runtime/watchdog-state.json`.
- Refreshed `docs/AGENT_SCHEDULE.md`, `docs/TOKEN_BUDGET_POLICY.md`, `docs/AGENT_EXECUTION_MATRIX.md`, `docs/NEXT_AGENT_PROMPT.md` and the root `NEXT_AGENT_PROMPT.md` around the supervised local scheduler model.

## 2026-06-01 - UX orchestration hardening pass

- Confirmed the active RouteTrust application lives under `routepulse-ai-tester`, not the parent workspace root.
- Upgraded both UX/UI agent prompt files so the agent now has explicit gating, route coverage, ownership boundaries, deliverables, and beta-honesty rules.
- Updated `docs/NEXT_AGENT_PROMPT.md` to hand off the UX/documentation stabilization priorities instead of stale runtime-only instructions.
- Standardized the bilingual README header switch to `English | Español`.
- Added a new full-stack task for the missing `/admin/drivers` surface in `docs/ACTIVE_TASKS.md`.
- Prepared the UX audit pass to be rerun against current repository reality.

## 2026-06-01 - Runtime alignment control pass

- Diagnosed real runtime drift between source state and the visible local server on `127.0.0.1:3000`.
- Confirmed the official visible runtime now serves `v0.15` and the new expandable version footer.
- Killed the temporary `127.0.0.1:3001` validation runtime.
- Added `scripts/runtime-status` and rewired `npm run runtime:status` to detect official/secondary local listeners and `/api/health`.
- Tightened `scripts/beta-check` so runtime drift blocks `BETA_STABLE_READY`.
- Updated operational docs for runtime status, footer validation and drift policy.
- Revalidated `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run qa:smoke` and HTTP checks on `3000`.
- Documented the remaining local runtime ownership blocker without publishing workstation-specific process details.

## 2026-06-01 - Playwright runtime recovery on Windows

- Verified Playwright `1.60.0` and Chromium cache health on the Windows Codex machine.
- Confirmed browser binaries were present and directly executable under `%LOCALAPPDATA%\\ms-playwright`.
- Added `scripts/qa-smoke-runtime.js` so `npm run qa:smoke` resolves a valid RouteTrust port and launches Playwright deterministically.
- Updated `playwright.config.ts` for headless Chromium, `workers: 1`, `trace: on-first-retry`, `screenshot: only-on-failure` and `video: retain-on-failure`.
- Restored real browser smoke to passing state: 7 Playwright smoke tests green.
- Added `docs/PLAYWRIGHT_RUNTIME_REPORT.md` with Windows runtime findings and remediation evidence.
- Revalidated `npm run build`, `npm run qa:security`, `npm run qa:smoke`, `npm run beta-check` and `npm run project:status`.

## 2026-06-01 - Agent scheduler anti-token-burn baseline

- Replaced the previous high-frequency scheduler loop with a 30-minute supervisory scheduler and a cheap watchdog.
- Added gating for git changes, task assignment, P0/P1 signals, cooldowns, file locks and manual-required work.
- Added runtime schedule, budget and last-run evidence files.
- Added per-agent latest reports in JSON and Markdown.
- Added scheduled prompts and execution boundaries for codex, devops, QA, web tester, backend, frontend, UX, security, maps and GTM agents.
- Added daily control reporting and estimated token savings accounting.

## 2026-06-01 - Node orchestrator P0 control pass

- Added the missing operational npm scripts required by the orchestrator baseline: `project:status`, `runtime:status`, `ops:doctor`, `ops:daily`, `ops:daily-summary`, `agent:budget`, `agent:dispatch`, `frontend:audit`, `backend:audit`, `tester:browser` and `devops:doctor`.
- Added supervised runtime wrappers under `scripts/` so missing capabilities now report `BLOCKED` explicitly instead of failing silently.
- Restored `npm run project:status` as a real runtime report backed by `runtime/project-status.json`.
- Removed hardcoded session-secret fallback behavior and replaced it with supervised local demo auth plus an explicit production failure path.
- Revalidated `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run project:status`, `npm run beta-check` and `npm run qa:smoke`.
- Confirmed the current stable-build blocker is browser smoke only; HTTP checks for `/api/health`, `/login`, `/track/demo` and `/admin/project-status` pass when the local app server is running.

## 2026-06-01 - Bilingual UX governance and design system baseline

- Added bilingual public repo documents for README, contributing, security, roadmap, beta stable criteria and AI-built positioning.
- Added product and design documentation for value proposition, brand, design system, components, customer experience, business manager experience and GitHub repo presentation.
- Added `src/design-system` token files for colors, typography, spacing and semantic state definitions.
- Added `agents/ux-ui-agent/prompt.md` to formalize UX ownership and scope.
- Replaced the old lightweight `ux:audit` script with a structured bilingual audit that reports severity, user type, impact and suggested fix.
- Added actionable UX-to-fullstack, UX-to-GitHub and UX-to-QA tasks into `docs/ACTIVE_TASKS.md`.

## 2026-05-31 - Git recovery and remote merge

- Diagnosed push rejection as unrelated histories, not a meaningful remote code delta.
- Confirmed `origin/main` only contained the bootstrap `Initial commit` with a minimal `README.md`.
- Created a local recovery checkpoint before integrating the remote bootstrap history.
- Merged `origin/main` with `--allow-unrelated-histories` and resolved the only conflict in `README.md` by preserving the RouteTrust README.
- Pushed `main` successfully to `https://github.com/tobiaspampinella/routetrust.git`.
- Updated publication reporting with the actual remote URL, merge strategy and remaining post-push risks.

## 2026-05-31 - GitHub publication hardening

- Added `docs/GITHUB_PUBLICATION_REPORT.md` as the current source of truth for publication state.
- Reworked public-facing repository docs for README status, security disclosure and milestone roadmap clarity.
- Replaced generic GitHub issue-template placeholders with actionable publication assumptions.
- Expanded repository label definitions and added manual setup docs for labels and branch protection.
- Hardened `.gitignore` to exclude `.next-build`, `.next-dev` and typecheck cache artifacts.
- Verified `npm test`, `npm run qa:security`, `npm run typecheck`, `npm run lint` and `npm run build`.
- Confirmed publication remained blocked at that moment by missing GitHub CLI / remote creation on this machine.

## 2026-06-01 - Runtime stabilization

- Removed stale Next build artifacts and rebuilt from a clean state.
- Updated `tsconfig.json` to stop including generated `.next` and `.next-app` type folders.
- Verified `npm test`, `npm run typecheck`, and `npm run build` after cleanup.
- Hardened `/api/cms/telegram/status` and `/api/cms/telegram/test` so missing Telegram env returns controlled non-500 responses.
- Added stabilization and HTTP smoke reports under `docs/`.

## 2026-06-01 - Supervised runtime hardening

- Added supervised runtime commands for scheduler, heartbeat, watchdog, lock sync/check, Telegram status/notify and local bug triage.
- Expanded agent runtime coverage with UX/UI, full stack debug, QA security and local bug assistant agents.
- Added `runtime/project-status.json` as the dynamic operational data source.
- Converted `/admin/project-status` from static cards to runtime-driven status rendering.
- Added `/admin/bug-reports` for the local triage queue.
- Added operational docs for Telegram setup and local 24/7 operation.

## 2026-06-01 - RouteTrust operational ignition

- Added project status page at `/admin/project-status`.
- Added navigation entry for project status in the admin shell.
- Added `beta-check` and `telegram:test` npm scripts.
- Added dev server status documentation.
- Added agent runtime status documentation.
- Kept Telegram in test-only mode; no bot workflow was added.

## 2026-05-31 - Beta SaaS Controlada v0.1 stabilization cycle

- Created stabilization branch `stabilization/beta-saas-v0.1`.
- Verified dependency install with the local Codex Node/npm wrapper.
- Verified typecheck, tests, lint and production build.
- Confirmed production audit blocker: critical Next.js advisory and moderate PostCSS advisory.
- Updated CI to run `npm test`.
- Added local traceability docs for issues, roadmap, architecture, QA and security.
- Updated README with RoutePulse SaaS Beta positioning, local wrapper commands and verified baseline status.

## 2026-05-31 - FASE 5 Beta core implementation

- Added Node test script with `tsx --test`.
- Added pure beta contracts for route simulation, project intelligence and bug reporting.
- Added basic CEO beta overview to admin dashboard.
- Added local operational incidents to app state and driver incident reporting.
- Added basic bug intake API at `/api/bugs`.
- Added Telegram project intelligence endpoint at `/api/cms/telegram/project-intelligence`.
- Connected CMS Telegram panel to project intelligence send action.
- Hardened map provider selection so Google only activates in `google_maps_ready`; fallback/mock remains available.
- Fixed local `next start` auth cookies so localhost HTTP sessions work while production remains secure.
- Updated visible app version to `v0.14`.
- Verified `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` and HTTP smoke routes.

## 2026-05-31 - FASE 3 GitHub formal repository setup

- Reviewed `.git`, branch, remote and working tree status.
- Hardened `.gitignore` for local env, build and test artifacts.
- Updated `.env.example` to avoid secret-like placeholder values.
- Updated README positioning for AI-built, human-orchestrated logistics operations.
- Added suggested GitHub topics.
- Updated CONTRIBUTING, SECURITY, ROADMAP and AI_BUILT_PROJECT.
- Updated issue templates, PR template and CI workflow.
- Verified no secret patterns were detected after updates.

## v0.13 - New PC restore and audit

- Restored the project ZIP into a clean `routepulse-ai-tester` folder.
- Installed dependencies with npm after correcting the local Node PATH issue.
- Generated `package-lock.json` because no lockfile was restored.
- Fixed a TypeScript seed typing issue in `prisma/seed.ts`.
- Verified `lint`, `typecheck`, `build` and key local smoke routes.
- Added restore, environment, installation, project audit, QA audit, demo sandbox audit and tech debt docs.
- Refreshed governance, active tasks, ownership, locks and beta build plan for the restored PC.
- Updated `.env.example` with missing maps and Telegram variables.

## v0.12 - Day 1 architecture foundation

- Added Day 1 repo audit, file inventory and environment/dependency gap analysis.
- Added `prisma/schema.prisma` as `[AWAITING_HUMAN_APPROVAL]`; no migration was run.
- Added full schema content to `docs/CURRENT_DECISIONS.md`.
- Added governance docs: Project Operating System, AI Governance, Agent Ownership, Beta Build Plan and Beta Stable Criteria.
- Expanded `.env.example` with database, Redis, JWT, maps, Telegram, Sentry and demo variables.
- Added local `docker-compose.yml` for Postgres, Redis and app services.
- Initialized local Git branch structure with `main`, `develop`, `staging` and agent branches.

## v0.11 - CMS sandbox approval core

- Added documented audit pass for CMS, Demo Sandbox, map/tracking and environment variables.
- Added `docs/DEMO_SANDBOX_SPEC.md` and `docs/CURRENT_DECISIONS.md`.
- Expanded CMS data model with approval requests and richer demo sandbox state/events.
- Added Human Approval Layer section with policies, pending requests and approve/reject actions.
- Upgraded CMS Demo Sandbox with controls to activate/deactivate, generate/reset demo, start/pause truck, change speed, simulate traffic, blocked street, delay, completed delivery and failed delivery.
- Connected sandbox actions to existing mock route/tracking state and audit logs.
- Added MapLibre/OpenStreetMap provider-ready option and reserved env variables for future routing integration.

## v0.10 - Real-map-ready fleet tracking

- Rebuilt `/track/demo` map experience as a fleet-management style live tracking view.
- Added Google Maps JavaScript API provider readiness through `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Added Directions + TrafficLayer support when a legal Google Maps key is configured.
- Added a commercial local fallback map so the demo still runs without API keys.
- Expanded demo route to five Buenos Aires stops with coordinates, traffic level, drop-off and priority.
- Updated `/admin/cms` demo preview to use the same fleet tracking map.
- Updated `.env.example` and README with real-map activation instructions.

## v0.09 - 7-day CMS beta core

- Added a stable CMS beta navigation inside `/admin/cms`.
- Added beta sections for overview, tenants, users, suggested routes, drivers, incidents, audit logs, Telegram settings, and demo sandbox.
- Added local CMS actions that register audit logs.
- Added protected Telegram CMS API endpoints:
  - `GET /api/cms/telegram/status`
  - `POST /api/cms/telegram/test`
- Added CMS server guard for basic permission and tenant checks.
- Updated `.env.example` with Telegram variables.

## v0.08 - Enterprise CMS beta

- Added CMS audit/spec/implementation docs.
- Added CMS domain types and services.
- Added first enterprise CMS panel for tenants, modules, RBAC, approvals and audit logs.

## v0.07 - QA hardening

- Hardened customer tracking demo for sales.
- Removed public edit controls from `/track/demo`.
- Hid footer on tracking/mobile contexts.
## v0.15 - runtime honesty and stable-local gate

- Added `GET /api/health` with degraded/fail semantics that avoid false `500` on missing Telegram config.
- Added durable local file-store helpers and runtime audit/project-event persistence.
- Added Playwright smoke coverage for login, admin status, driver route, tracking demo, bug intake, health and Telegram status.
- Updated beta-check to classify `LOCAL_DEMO_READY`, `BETA_STABLE_READY` and `STAGING_READY` instead of reporting generic completion.
- Reduced runtime churn by moving process markers/logs to `runtime/logs` and ignoring volatile runtime files in git.
