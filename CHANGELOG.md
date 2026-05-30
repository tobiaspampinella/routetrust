# Changelog

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
