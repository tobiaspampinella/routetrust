# RouteTrust

[English](README.md) | [Español](README.es.md)

RouteTrust is an AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

This repository contains the current RouteTrust beta foundation for:

- customer tracking
- business manager visibility
- driver route execution
- operational KPIs
- CMS-led demo control
- supervised bug intake

It is a controlled local beta. It is not a production TMS, ERP, or autonomous dispatch platform.

## Product Position

RouteTrust is designed for two operational audiences:

- Customers who need clear tracking, ETA, status, delay visibility, and confidence.
- Business managers who need operational KPIs, route status, driver status, incidents, bugs, and system truth.

Core positioning:

- AI-built
- human-orchestrated
- operationally clear
- enterprise-ready in presentation
- honest about beta limits

## Current Status

- Local beta app is available.
- Admin, driver, customer tracking, and driver visibility surfaces exist.
- UX and repository documentation are being hardened.
- Browser-based QA evidence is still partial.
- Production readiness is not claimed.

## Public Documentation

- [README.es.md](README.es.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CONTRIBUTING.es.md](CONTRIBUTING.es.md)
- [SECURITY.md](SECURITY.md)
- [SECURITY.es.md](SECURITY.es.md)
- [ROADMAP.md](ROADMAP.md)
- [ROADMAP.es.md](ROADMAP.es.md)
- [BETA_STABLE_CRITERIA.md](BETA_STABLE_CRITERIA.md)
- [BETA_STABLE_CRITERIA.es.md](BETA_STABLE_CRITERIA.es.md)
- [AI_BUILT_PROJECT.md](AI_BUILT_PROJECT.md)
- [AI_BUILT_PROJECT.es.md](AI_BUILT_PROJECT.es.md)
- [docs/product/VALUE_PROPOSITION.md](docs/product/VALUE_PROPOSITION.md)
- [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md)
- [docs/design/UX_AUDIT_REPORT.md](docs/design/UX_AUDIT_REPORT.md)
- [docs/GITHUB_REPO_PRESENTATION.md](docs/GITHUB_REPO_PRESENTATION.md)

## Product Surfaces

Public:

- `/`
- `/login`
- `/track/demo`

Business manager:

- `/admin`
- `/admin/routes`
- `/admin/drivers`
- `/admin/kpis`
- `/admin/cms`
- `/admin/project-status`
- `/admin/bug-reports`
- `/admin/settings`

Driver:

- `/driver`
- `/driver/route`

Current public marketing routes such as `/contact`, `/product`, `/use-cases`, `/customers`, and `/demo` are not implemented yet and remain tracked as product gaps.

## Design System

RouteTrust is moving to an operational design system centered on:

- graphite and dark neutral surfaces
- operational blue as the primary accent
- green for success
- amber for warnings
- red for incidents
- low-noise layouts and dense but readable dashboards

Source files:

- `src/design-system/tokens.ts`
- `src/design-system/colors.ts`
- `src/design-system/typography.ts`
- `src/design-system/spacing.ts`
- `src/design-system/components.md`

## Quickstart

Prerequisites:

- Node.js 22+
- npm

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000/login
```

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run ux:audit
```

Optional browser validation:

```bash
npm run qa:smoke
```

## Beta Boundaries

- Local runtime and local persistence still exist in parts of the product.
- Browser QA is still required before calling a build stable.
- Telegram and external map providers remain optional or blocked by configuration.
- Human approval remains mandatory for releases, critical product decisions, and sensitive operational changes.

## Contribution Model

See [CONTRIBUTING.md](CONTRIBUTING.md). Meaningful changes must update:

- `CHANGELOG.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/ACTIVE_TASKS.md` when ownership or follow-up work changes

## Security

See [SECURITY.md](SECURITY.md). Public docs are intentionally redacted and must not contain secrets, exploit details, personal credentials, or unnecessary personal contact data.
