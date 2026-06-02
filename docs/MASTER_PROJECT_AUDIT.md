# RouteTrust Master Project Audit

Generated: 2026-06-01
Workspace audited: `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`

## Verdict

RouteTrust is a functional local logistics demo with some durable local runtime files. It is not beta stable, not staging ready, and not SaaS implementable today.

The product surface is stronger than a static mock: admin, driver, customer tracking, bug intake, local health, local audit files, route simulation, KPI calculations, protected routes and a supervised local runtime exist. The commercial backend is still mostly absent: no real auth provider, no production database path, no tenant isolation backed by DB, no staging URL, no production observability, no CI evidence for the current dirty tree, and no deploy-ready persistence model.

## Git State

- Root `C:\Users\tobii\OneDrive\Documents\RouteTrust` is not a Git repository.
- Actual repo: `routepulse-ai-tester`.
- Branch: `main...origin/main [ahead 1]`.
- Worktree: dirty, 131 entries reported by `beta-check`.
- Impact: blocks any honest `BETA_STABLE_READY` claim.

## GitHub State

- Remote: `https://github.com/tobiaspampinella/routetrust.git`.
- GitHub repo exists, public, default branch `main`.
- Local bilingual files such as `README.es.md` exist untracked locally, but `README.es.md` was not found on remote `main`.
- CI workflow exists remotely and runs install, typecheck, lint, tests and build.
- Remote is behind local dirty work. Published repo does not represent this workspace.

## Required Command Matrix

| Command | Result | Evidence | Impact |
|---|---:|---|---|
| `git status --short --branch` | warning | `main` ahead 1, dirty tree | Blocks beta stable |
| `git remote -v` | pass | origin points to GitHub | GitHub configured |
| `git branch -vv` | warning | multiple local agent branches, `main` ahead 1 | Needs branch hygiene |
| `npm run typecheck` | pass | exit 0 | OK |
| `npm run lint` | pass with warning | ESLintRC deprecated warning | Not blocking now; future migration needed |
| `npm test` | pass | 10 tests passed | Narrow unit coverage only |
| `npm run build` | pass | Next.js build generated 27 app routes | Buildable |
| `npm run beta-check` | fail | exit 1, `LOCAL_DEMO_READY`, blocker `git_worktree_clean` | Blocks beta stable |
| `npm run project:status` | warning | server on, staging missing, beta stable false | Useful runtime truth |
| `npm run agents:status` | pass | scripts report cooldown/skipped/executed states | Agents are scripts, not autonomous workers |
| `npm run qa:smoke` | flaky-pass | 6 passed, 1 flaky in this run | Blocks confidence |
| `npm run qa:security` | pass | baseline report written | Limited security surface only |

Additional checks:

- `npm audit --omit=dev --audit-level=critical`: 0 vulnerabilities.
- `npx prisma validate`: failed because `DATABASE_URL` is missing.
- `npm run start -- -p 3002`: production server started and `/login` returned 200.
- Production `/api/health` on 3002 returned `degraded` because auth secret missing, maps fallback and runtime degraded.

## Build State

Build is real and currently passes. The output exposes app routes for admin, driver, tracking and APIs. A suspicious duplicate API route appears in the build table: `/api/bugs/[bugId]/route` at `0 B`, caused by `src/app/api/bugs/[bugId]/route/route.ts`. This should be treated as a routing hygiene defect.

## Test State

Unit tests cover pure library behavior: bug reporting, local assistant routing, project intelligence and route simulation. This is useful but too narrow for beta stable.

Browser smoke exists and covers login, admin, driver, tracking, health, Telegram status and bug report creation. The audited run showed one flaky admin login test: first attempt stayed at `/login`, retry passed. That is not clean enough for beta stable.

## Server State

- Dev server on `127.0.0.1:3000`: running.
- Current `/api/health`: `degraded`, not `ok`.
- Production start: runs on port 3002 after build.
- Staging URL: missing.
- Runtime files are local and depend on filesystem writes under the repo.

## Agents State

Agents are documented and script-driven. `project:status` says no LLM workers and no autonomous agents. `agents:status` reports cooldown/skipped/executed counters. Do not claim autonomous agent operation.

## Security State

No obvious committed secret was detected by the local scripts. Auth is still demo-grade: static local users, local HMAC session token, richer CMS roles mapped from only `admin` and `driver`, and tenant allowance hardcoded in `serverGuards`.

Security blockers for production:

- No real identity provider or user lifecycle.
- No persisted RBAC.
- No DB-enforced tenant isolation.
- No production secret contract proven in deployed runtime.
- No rate limiting or abuse control on APIs.
- Bug report storage is local filesystem JSON.

## Beta State

`LOCAL_DEMO_READY: YES`

`BETA_STABLE_READY: NO`

Reasons:

- dirty Git tree
- flaky smoke evidence
- no staging URL
- no production DB config
- local filesystem persistence
- demo auth
- missing public product routes

## Staging State

`STAGING_READY: NO`

No staging URL is configured. No remote deployment evidence was found. Production start can run locally, but that is not staging readiness.

## SaaS Real State

`SAAS_IMPLEMENTABLE: NO`

The UI and demo logic can support sales discovery. The system cannot safely operate a real B2B logistics customer because the operational source of truth is not a real DB-backed, tenant-scoped backend.
