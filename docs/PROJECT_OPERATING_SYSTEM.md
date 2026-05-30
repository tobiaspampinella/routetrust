# Project Operating System

Last updated: 2026-05-30
Project: RoutePulse AI / RouteTrust
Positioning: AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.
Current mode: restored ZIP on new PC; beta stabilization first.

## Prime Directive

Do not build new features until restore, install, audit, Git setup and minimum build validation are complete.

## Operating Rules

- Stability before features.
- Human approval for routes, reassignment, permissions, tenant changes, releases and merges to main.
- No global refactors without explicit approval.
- No paid map/API dependency can block demo mode.
- No secrets in repo.
- Every important change updates `CHANGELOG.md` and `NEXT_AGENT_PROMPT.md`.
- Every architecture decision updates `docs/CURRENT_DECISIONS.md`.
- Every active task uses `docs/ACTIVE_TASKS.md`.
- Every file ownership conflict is resolved in `docs/LOCKED_FILES.md`.

## Work Cycle

1. Read `docs/ACTIVE_TASKS.md` and `docs/LOCKED_FILES.md`.
2. Claim only the files needed.
3. Make the smallest stable slice.
4. Run relevant gates.
5. Update docs and changelog.
6. Release or hand off locks.
7. Report evidence, risks and next step.

## Branch Policy

- `main`: approved stable builds only.
- `develop`: integration.
- `staging`: pre-release validation.
- `restore/new-pc-audit`: recovery/audit branch if existing Git history is present.
- `agent/*`: parallel agent work branches.

Current restore note: ZIP did not include `.git`; initialize Git on `main`, then create `develop` after the first approved commit.
