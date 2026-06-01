# Changelog

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
