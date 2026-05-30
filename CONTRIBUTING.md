# Contributing

RoutePulse AI is an AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

## Workflow

- Work from `develop` or an `agent/*` branch.
- Do not push directly to `main`.
- Check `docs/ACTIVE_TASKS.md` and `docs/LOCKED_FILES.md` before editing.
- Keep changes scoped to the task owner.
- Update `CHANGELOG.md` and `NEXT_AGENT_PROMPT.md` for meaningful changes.

## Local Gates

Run before opening a PR:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

On the restored Windows PC, use the command wrapper documented in `docs/ENVIRONMENT_SETUP.md`.

## Human-In-The-Loop

AI agents may suggest and implement scoped changes, but humans approve releases, merges to main, permissions, tenant changes and critical operational decisions.
