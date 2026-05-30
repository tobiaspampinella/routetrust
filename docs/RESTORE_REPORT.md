# Restore Report

Date: 2026-05-30
Owner: Principal AI Node Orchestrator
Project root: `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`
Source ZIP: `C:\Users\tobii\OneDrive\Documents\RouteTrust\RoutePulseAI_Portable_Cycle0_2026-05-27.zip`

## Restore Status

- ZIP located in `C:\Users\tobii\OneDrive\Documents\RouteTrust`.
- ZIP contained one top-level folder: `routepulse-ai-tester`.
- Restored into a clean folder; no previous project folder was overwritten.
- No `.git` directory was included in the ZIP.

## Structure Detected

- Next.js app: `src/app`
- API routes: `src/app/api`
- Components: `src/components`
- Domain logic: `src/lib`, `src/services`, `src/store`
- Prisma schema and seed: `prisma/schema.prisma`, `prisma/seed.ts`
- Documentation: `docs`
- Local services: `docker-compose.yml`

## Key Files Found

- `package.json`
- `.env.example`
- `README.md`
- `CHANGELOG.md`
- `NEXT_AGENT_PROMPT.md`
- `docs/PROJECT_OPERATING_SYSTEM.md`
- `docs/AI_GOVERNANCE.md`
- `docs/ACTIVE_TASKS.md`
- `docs/CURRENT_ARCHITECTURE.md`
- `docs/CMS_AUDIT.md`
- `docs/DEMO_SANDBOX_SPEC.md`

## Missing Or Not Included

- Lockfile was missing, so npm generated `package-lock.json`.
- `.git` was missing, so this restore must initialize Git locally.
- `public` folder was not present.
- Dedicated backend app folder was not present; backend behavior is currently App Router API routes.
- Playwright/Cypress tests were not present.
- Docker CLI is not installed on this PC, so Postgres/Redis compose could not be validated locally.

## Migration Risks

- Windows PATH points `node` to a blocked WindowsApps Codex executable. Install scripts fail unless PATH is prepended with the bundled Node path.
- Next.js `15.1.3` is deprecated by npm with a security warning; upgrade must be planned after restore validation.
- Recharts `2.x` is deprecated; upgrade to v3 should be planned after beta stabilization.
- Prisma install scripts require a working `node` command.
- OneDrive may lock `node_modules` paths during install cleanup.

## Next Steps

1. Keep using the explicit Node path for local commands until Node/npm are installed normally.
2. Initialize Git and keep secrets out of commits.
3. Address Next.js security upgrade in a dedicated dependency hardening task.
4. Add Playwright smoke coverage for beta flows.
