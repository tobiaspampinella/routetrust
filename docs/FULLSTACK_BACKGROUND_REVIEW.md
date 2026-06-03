# Full Stack Background Review

Owner: Claude Secondary (background engineering agent)
Date: 2026-06-02
Phase: FASE D — Full-stack reality check
Status: First-pass static review. No code modified.

> Verification limit: shell did not boot, so `npm run build`, `db:validate`,
> route enumeration and runtime probes did not run. Classifications are derived
> from `package.json`, `README.md`, `docs/BETA_STABLE_CRITERIA.md`,
> `docs/ACTIVE_TASKS.md`, `.env.example` and the inspected `src/app` files.
> Re-verify against the running app before acting.

## Headline
The project is **still a local demo/beta**, not a real SaaS yet. The frontend and
design system are the most mature layer; persistence, auth-as-real, tenant
isolation and tracking tokens are mock/partial. This matches the project's own
stated status (`LOCAL_DEMO_READY: YES`, `SAAS_IMPLEMENTABLE: NO`).

## Module classification

Legend: REAL_IMPLEMENTED · PARTIAL_IMPLEMENTED · DEMO_ONLY · MOCK_ONLY · DOCUMENTATION_ONLY · BROKEN · MISSING

| Module | Status | Evidence |
|---|---|---|
| Frontend (Next 15 App Router, Tailwind, design tokens) | REAL_IMPLEMENTED | `globals.css` token system; polished `login` page; shadcn primitives |
| Auth / session | PARTIAL_IMPLEMENTED | `/api/auth/me`, `bcryptjs`, `JWT_SECRET`/`AUTH_SECRET` envs, middleware blocks `/admin`; but criteria call login "partial" and identity not production-grade |
| Login (admin demo) | PARTIAL_IMPLEMENTED | works for `admin@demo.com` (criteria #1) |
| TENANT_ADMIN role | MISSING | criteria #2 `[pending]` |
| Driver portal / route execution | PARTIAL_IMPLEMENTED | start/arrive/complete/fail/incident all `[implemented]` but on local state |
| Customer tracking demo | DEMO_ONLY | `CustomerTrackingDemo` component; magic token not implemented (criteria #20) |
| CMS (tenants, approvals, incidents, audit) | MOCK_ONLY | criteria #5/#6/#8 "mock state"; approvals/audit local only |
| Route engine / ETA recalculation | PARTIAL_IMPLEMENTED | ETA recalc + risk marking `[implemented]` over mock routes |
| Incidents | PARTIAL_IMPLEMENTED | local-state per ACTIVE_TASKS FS-002 |
| Database (PostgreSQL/Prisma) | PARTIAL_IMPLEMENTED | Prisma deps + `db:*` scripts + bundled `runtime/postgres`; but "no production DB persistence" per blockers |
| Bug reports intake/triage | MOCK_ONLY | criteria + ACTIVE_TASKS: in-memory, not durable |
| `/health` endpoint | MISSING | criteria #23 `[pending]` |
| beta-check | REAL_IMPLEMENTED | `scripts/beta-check` wired as `npm run beta-check` |
| Maps provider | MOCK_ONLY | MapLibre is mock/fallback only; no real provider dependency (criteria #21, MAPS-002) |
| Telegram integration | DOCUMENTATION_ONLY / DEMO_ONLY | endpoints exist but require env; "descartado temporalmente" per ACTIVE_TASKS; excluded from beta gate |
| CI (GitHub Actions) | PARTIAL_IMPLEMENTED | `ci.yml` referenced; local lint/test/typecheck/build pass; Playwright suite pending |
| Playwright e2e/smoke | MISSING | criteria #24; no regression suite yet |
| Agent runtime (scheduler/heartbeat/watchdog) | PARTIAL_IMPLEMENTED | many `scripts/*` wired; OPS-003 still pending in ACTIVE_TASKS |

## Real vs demo gap (SaaS reality)
- **Frontend connected to real APIs:** partly. Auth hits `/api/auth/me`; most
  product data is Zustand/mock.
- **Backend real vs demo:** demo. Prisma scaffolding exists but main flows are not
  DB-backed.
- **CMS real vs visual:** visual/mock.
- **Bug reports DB/file:** in-memory (not durable).
- **Tenant isolation proof:** none against a real DB.
- **Tracking:** demo; no magic/customer token.

## P0 / P1 full-stack issues
- **P1 — No durable persistence** for core product flows (bug reports, CMS,
  routes). This is the central blocker to "SaaS real". Codex-owned.
- **P1 — `/health` missing.** Cheap to add; gates staging/uptime checks.
- **P1 — No Playwright smoke** for admin/driver/tracking; static review cannot
  substitute for it.
- No P0 (app-down / build-broken) issue was introduced by this agent; none
  confirmed from static review, but build was not run this session.

## Recommended next actions (do not implement here — Codex-owned)
1. Minimum durable backend path (Prisma migrations + one real persisted entity,
   e.g. bug reports) — already Codex's stated NEXT_STEP in ACTIVE_TASKS.
2. Add `/health` route (small, unblocks staging).
3. Add Playwright smoke for the 3 critical flows.
A handoff for the highest-leverage non-core item is at
`runtime/claude-secondary/codex-handoff.md`.
