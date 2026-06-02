# Autonomous Ops Limits

This system is intentionally limited.

## It Can Do Without Human Input

- Run cheap status checks.
- Classify P0/P1/P2 signals.
- Detect missing DB configuration.
- Detect dirty worktree and pending GitHub push.
- Detect Ollama availability.
- Prepare one Codex task prompt.
- Execute one queued P0/P1 Codex task when `npm run codex:run`, `npm run ops:daemon:codex` or `CODEX_AUTORUN=1` is used.
- Modify core source files when the queued task explicitly allows them.
- Update generated runtime reports.
- Apply narrow `.gitignore` runtime safety fixes.

## It Cannot Do Without Human Approval

- Merge to main.
- Release.
- Declare beta stable.
- Run local DB bootstrap and apply committed Prisma migrations.
- Change Prisma schema through a queued Codex task.
- Change auth, RBAC or tenant isolation.
- Deploy.
- Decide security readiness.
- Force push.
- Upload secrets.

## Explicit Non-Goals

- No autonomous LLM workers are claimed outside the explicit Codex runner.
- Codex is not run every 30 minutes unless `CODEX_AUTORUN=1` is intentionally configured.
- Full build is not run by the 30 minute watchdog.
- GitHub push is not retried every 30 minutes.
- P2 work does not consume Codex tokens by default.
