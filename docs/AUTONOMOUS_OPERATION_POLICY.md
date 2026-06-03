# Autonomous Operation Policy

RouteTrust does not have full autonomy. It has supervised local operations.

## Rules

1. P0 findings may generate a Codex task automatically.
2. P1 findings may generate a Codex task only when they affect beta stable readiness.
3. P2 findings go to the local model or backlog.
4. Docs, translation and copy drafts may be delegated to the local model.
5. DB, auth, security and deploy work is reserved for Codex GPT-5.5.
6. Never modify `main` directly.
7. Never force push.
8. Never commit secrets.
9. Never declare stable without required checks.
10. Never repeat the same task if it already failed because of network or credentials.

## Severity

P0:

- broken build
- app cannot start
- `/api/health` failure
- smoke failure
- exposed secret pattern
- broken auth
- broken DB when `DATABASE_URL` is configured
- failed migration evidence

P1:

- missing DB
- blocked Prisma baseline
- pending GitHub push
- dirty worktree
- CMS without DB
- demo API where real persistence is required

P2:

- UX polish
- docs
- premium maps
- Telegram credentials
- GTM
- copy

## Codex Boundary

`scripts/ops-daemon.js` does not execute Codex GPT-5.5. It prepares `runtime/codex-queue/next-codex-prompt.md` when a concrete P0/P1 task exists.

Merge and release approval stays human.
