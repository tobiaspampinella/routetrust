# Autonomous Operation Policy

RouteTrust autonomous ops is controlled automation, not full autonomy.

## Decision Rules

1. P0 can generate a Codex task automatically.
2. P1 can generate a Codex task only when it affects beta stable readiness.
3. P2 goes to local model analysis or backlog.
4. Docs, translation, copy, superficial UX notes and log summaries can be delegated to a local model.
5. DB, auth, security, deploy, RBAC, tenant isolation and architecture are Codex GPT work with prechecks and postchecks.
6. Never modify `main` directly.
7. Never force push.
8. Never upload secrets.
9. Never declare stable without checks.
10. Never repeat the same task if it already failed because of network or credentials.

## Severity Map

P0:

- Broken build.
- App cannot start.
- `/api/health` fails.
- Smoke check fails.
- High-confidence secret exposure.
- Auth breakage.
- DB failure when `DATABASE_URL` is configured.
- Failed migration.

P1:

- Missing `DATABASE_URL`.
- Prisma blocked.
- GitHub push pending.
- Dirty worktree.
- CMS operating without DB.
- Demo API or file fallback where a real beta path is required.

P2:

- UX polish.
- Docs.
- Premium maps.
- Telegram without credentials.
- GTM.
- Copy.

## Execution Boundary

- `npm run ops:daemon` runs a single local cycle.
- The Windows task scheduler can run that cycle every 30 minutes.
- The watchdog uses cheap checks only by default.
- The watchdog runs `npm run beta-check -- --cheap`; full `npm run beta-check` remains reserved for post-change validation and readiness gates.
- `npm run github:sync` has a 6 hour cooldown.
- Codex CLI execution is available through `npm run codex:run`.
- `npm run ops:daemon -- --run-codex` or `CODEX_AUTORUN=1` can execute the next P0/P1 task.
- Default scheduled watchdog cycles keep Codex disabled unless explicitly configured.
- P0/P1 tasks are written to `runtime/codex-queue/tasks.json`.
- The next Codex prompt is written to `runtime/codex-queue/next-codex-prompt.md`.
- The runner can modify core source files when the task `allowedFiles` includes them.
- The runner never merges to `main`, never force pushes and never commits env/secret material.
