# RouteTrust

RouteTrust is an AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

AI agents assist with implementation, testing, documentation and analysis. Human oversight remains mandatory for strategic product decisions, critical approvals, releases and business direction.

This repository currently contains the RoutePulse AI beta application: a controlled SaaS B2B logistics foundation focused on route simulation, tracking, driver coordination, operational visibility, CMS workflows and demo validation.

It is not a full TMS, ERP or autonomous dispatch system.

## Current Status

- Local demo functional.
- Beta stabilization in progress.
- GitHub remote setup in progress.
- Telegram integration requires environment configuration.
- Not production-ready yet.

## Product Scope

- Control tower lite for last-mile logistics operations.
- Human-approved operational intelligence, not operator replacement.
- Admin, operations, driver, customer tracking and CMS beta workflows.
- Demo sandbox for route simulation, ETA changes, traffic scenarios and operational approvals.
- Optional map-provider integration with a local fallback.

## Core Modules

- Admin dashboard and operational KPIs.
- Driver portal and route execution views.
- Customer tracking demo.
- CMS beta modules for tenants, approvals, incidents, audit logs and demo controls.
- QA and bug-report intake flows.
- Telegram status/test integrations.

## Repository Status

- Stage: beta stabilization.
- Primary stack: Next.js, TypeScript, Tailwind CSS, Prisma.
- Package manager: npm.
- CI: GitHub Actions workflow included in `.github/workflows/ci.yml`.
- Secrets policy: `.env` files, provider tokens and deployment credentials must never be committed.

## Suggested GitHub Topics

`logistics`, `saas`, `b2b`, `operational-intelligence`, `route-simulation`, `route-optimization`, `tracking`, `fleet-management`, `human-in-the-loop`, `ai-built`, `typescript`, `nextjs`, `nestjs`, `postgresql`, `telegram-bot`, `maplibre`, `google-maps`, `playwright`

## Installation

Prerequisites:

- Node.js 22 or newer.
- npm.

From the repository root:

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000/login
```

## Validation

Run the baseline checks before opening a pull request:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Scripts

- `npm run dev`: local development server.
- `npm run build`: production build validation.
- `npm run lint`: static lint checks.
- `npm run typecheck`: TypeScript validation.
- `npm test`: local unit and contract tests.
- `npm run qa:security`: repository secret and auth-surface audit.
- `npm run beta-check`: beta readiness summary.
- `npm run agents:status`: supervised runtime status.
- `npm run telegram:status`: Telegram configuration status.

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Populate only the variables you need locally. Keep real credentials out of version control.

Optional map-related variables:

```txt
NEXT_PUBLIC_MAP_PROVIDER=maplibre
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
NEXT_PUBLIC_OPENROUTE_API_KEY=
NEXT_PUBLIC_APPLE_MAPKIT_TOKEN=
```

If no external map key is configured, the demo uses a local fallback visualization.

## Demo Credentials

Demo credentials are generated locally through seed/demo scripts and must not be used in production.

If local QA access is required, see [`docs/DEMO_LOCAL_ONLY.md`](docs/DEMO_LOCAL_ONLY.md). That document is explicitly local-only and must not be used as deployment guidance.

## Available Routes

- `/login`
- `/admin`
- `/admin/routes`
- `/admin/kpis`
- `/admin/cms`
- `/admin/settings`
- `/driver`
- `/driver/route`
- `/track/demo`

## Telegram Bot

The repository includes Telegram-oriented status and test flows for operational notifications. Bot tokens and chat identifiers must stay in local or deployment secrets only.

Relevant endpoints and docs:

- `/api/cms/telegram/status`
- `/api/cms/telegram/test`
- `/api/cms/telegram/project-intelligence`
- `docs/TELEGRAM_SETUP_REQUIRED.md`

## Bug Assistant

The repository includes a supervised local bug intake and triage surface for beta operations.

Relevant areas:

- `/admin/bug-reports`
- `/api/bugs`
- `docs/BUG_REPORTING_ASSISTANT.md`

## Agent Runtime

The current runtime is supervised and local-first. It provides status reporting, lock checks, QA scripts and operational traceability. It is not an autonomous production agent platform.

Relevant docs:

- `AGENT_RUNTIME.md`
- `docs/AGENT_RUNTIME_STATUS.md`
- `docs/LOCAL_24_7_OPERATION.md`

## Demo Sandbox

The demo sandbox allows controlled simulation of:

- route starts and pauses
- traffic changes
- blocked streets and delays
- completed and failed deliveries
- approval and audit-log flows

This is for beta validation and product discovery. It is not a production event engine.

## Security

Security reporting and repository policy are documented in [`SECURITY.md`](SECURITY.md).

Key constraints:

- no committed `.env` files
- no provider tokens in source
- no production claims for demo-grade auth or mock persistence
- human approval required for critical operational decisions

## Contributing

Contribution guidelines and branch workflow are documented in [`CONTRIBUTING.md`](CONTRIBUTING.md).

Branch model:

- `main`: stable releases only
- `develop`: integration branch
- `staging`: pre-release validation
- `feature/*`: feature work
- `fix/*`: bug fixes
- `agent/*`: isolated agent work

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for the public milestone roadmap and [`docs/BETA_BUILD_PLAN.md`](docs/BETA_BUILD_PLAN.md) for the internal short-horizon stabilization plan.

## AI-Built / Human-Orchestrated

See [`AI_BUILT_PROJECT.md`](AI_BUILT_PROJECT.md) for communication rules, approval boundaries and positioning constraints.

## Beta Stable Criteria

The formal beta checklist and blockers are tracked in [`docs/BETA_STABLE_CRITERIA.md`](docs/BETA_STABLE_CRITERIA.md).

A top-level summary copy is available in [`BETA_STABLE_CRITERIA.md`](BETA_STABLE_CRITERIA.md).

## Current Limits

- No production-grade backend persistence for the main product flows.
- No realtime multi-user sync or WebSockets.
- No production tenant isolation proof against a real database.
- No production identity system.
- Optional external maps are not mandatory and may remain disabled.
- Several product areas still depend on local state and mock data.
