# Token Saving Policy

RouteTrust autonomous ops is designed to avoid burning Codex tokens on routine checks.

## Routing

- P0: prepare one concrete Codex task.
- P1: prepare a Codex task only if beta stable is affected.
- P2: send to local model or backlog.
- Docs/copy/translation: local model when available.
- DB/auth/security/deploy: Codex GPT-5.5 only.

## Watchdog Budget

Every 30 minutes, the watchdog may run:

- `git status --short --branch`
- `git remote -v`
- `npm run project:status`
- `npm run beta-check` in cheap mode
- `npm run agents:status`
- `GET /api/health`
- environment presence checks
- GitHub ahead/dirty checks

It does not run Codex, full build or smoke by default.

## Codex Queue

Codex receives one task per cycle through:

- `runtime/codex-queue/tasks.json`
- `runtime/codex-queue/next-codex-prompt.md`

The queue prevents multiple large tasks from running in parallel.
