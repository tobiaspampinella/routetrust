# Beta Stable Criteria

Last updated: 2026-06-01

RouteTrust must distinguish three baselines. Local automation is not the same thing as stable product readiness.

## LOCAL DEMO

Allowed:

- local server
- local scheduler
- demo users
- local file storage
- fallback maps
- Telegram not configured
- no staging URL

Required:

- `/login` works
- `/track/demo` works
- `/admin` loads after demo login
- typecheck, lint and unit tests pass

## BETA STABLE LOCAL

Required:

- build passing
- typecheck passing
- lint passing
- unit tests passing
- browser smoke passing
- Git worktree clean and reviewable
- `/api/health` returns 200
- bug reports persist durably in `data/runtime/bug-reports.json`
- audit log persists durably in `data/runtime/audit-log.json`
- project status reports autonomy limits honestly
- no 500 on `/login`, `/admin`, `/admin/cms`, `/track/demo`, `/driver`, `/driver/route`, `/admin/project-status`, `/api/health`
- auth stays explicitly demo or explicitly configured
- beta-check classifies blockers honestly
- official runtime ownership is clear
- official runtime can be cleanly restarted on port `3000`
- no secondary runtime remains on `3001`

Not enough:

- heartbeats
- scheduler activity
- generated reports
- agent docs
- visible `v0.15` alone without clean process control

## STAGING READY

Required:

- remote GitHub configured
- CI passing
- env contract documented
- persistent storage in place
- no silent demo secret fallback
- Telegram either configured or explicitly optional
- remote smoke evidence
- deployment URL

## Hard Rule

The system cannot report `BETA_STABLE_READY` when it only satisfies `LOCAL DEMO`.

## Current Reality

- `LOCAL_DEMO_READY`: achieved on `http://127.0.0.1:3000`
- `BETA_STABLE_READY`: `NO` on 2026-06-01 unless runtime checks pass and the Git worktree is clean; a dirty tree is not a validated release candidate
- `STAGING_READY`: `NO`; no staging URL exists
- Browser smoke is green in this cycle; honesty of the stable gate now depends on runtime alignment and Git cleanliness
