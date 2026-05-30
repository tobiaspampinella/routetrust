# Agent Ownership

Last updated: 2026-05-30

## Principal AI Node Orchestrator

Owns recovery, governance, sequencing, locks, branch policy, build gates and handoffs.

Primary files: `docs/ACTIVE_TASKS.md`, `docs/LOCKED_FILES.md`, `docs/CURRENT_DECISIONS.md`, `docs/PROJECT_OPERATING_SYSTEM.md`.

## Full Stack Engineer Agent

Owns CMS, backend APIs, auth, RBAC, tenant isolation, route simulation persistence, driver portal and customer tracking backend contracts.

Primary files: `src/app/api/**`, `src/services/**`, `src/middleware.ts`, `prisma/schema.prisma`.

## QA Analyst Agent

Owns Playwright/Cypress, smoke tests, regression, beta checklist and release validation.

Primary files: `tests/**`, `playwright.config.ts`, `docs/QA_AUDIT.md`, `docs/BETA_STABLE_CRITERIA.md`.

## Operational Intelligence Auditor Agent

Owns operational usefulness, ETA/SLA logic, human approval, incident logic and scope control.

Primary files: `src/lib/etaCalculations.ts`, `src/lib/kpiCalculations.ts`, `src/lib/operationalInsights.ts`, approval/audit services.

## Demo Experience Engineer Agent

Owns demo sandbox, route playback, demo drivers, demo incidents and commercial demo flow.

Primary files: `src/lib/trackingSimulation.ts`, `src/store/routePulseStore.ts`, `src/components/customer/**`, `src/components/driver/**`.

## UX/UI Admin Experience Agent

Owns CEO/Admin CMS clarity, internal guides, onboarding, tooltips, empty states and navigation.

Primary files: `src/components/admin/**`, `src/app/admin/**`, `src/app/globals.css`.

## Maps & Tracking Research Agent

Owns Google Maps, TrafficLayer, Routes API, Photorealistic 3D, Apple MapKit research and MapLibre fallback.

Primary files: `docs/MAP_INTEGRATION.md`, map provider components, `.env.example`.

## Telegram Project Intelligence Agent

Owns Telegram bot, project events, command router and CMS test notification.

Primary files: `src/app/api/cms/telegram/**`, `docs/TELEGRAM_BOT_SETUP.md`, `docs/TELEGRAM_EVENTS.md`.

## Bug Reporting Assistant Agent

Owns visible bug/support assistant, local classification, ticket creation, routing and critical Telegram notification.

Primary files: `src/components/shared/CxAssistantWidget.tsx`, bug report API/model, `docs/BUG_REPORTING_ASSISTANT.md`.

## GitHub Public Repo Agent

Owns README, CONTRIBUTING, SECURITY, ROADMAP, issue templates, PR template and CI workflow.

Primary files: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`, `.github/**`.

## Documentation Agent

Owns changelog, handoff, specs and beta criteria.

Primary files: `CHANGELOG.md`, `NEXT_AGENT_PROMPT.md`, `docs/**`.
