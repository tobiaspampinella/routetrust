# Contributing

RoutePulse AI is an AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

## Branch Workflow

- `main`: stable approved builds only.
- `develop`: integration branch.
- `staging`: release candidate validation.
- `stabilization/*`: recovery and stabilization work.
- `agent/*`: isolated work by agent or module.
- `feature/*`: feature work.
- `fix/*`: bug fixes.

Do not push directly to `main`.

## Before Editing

1. Read `docs/ACTIVE_TASKS.md`.
2. Read `docs/LOCKED_FILES.md`.
3. Confirm the target files are not locked by another agent.
4. Keep the change scoped to the assigned task.

## Required Local Checks

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

If a script is unavailable or fails, document the failure and minimum proposed fix in the task handoff.

## Human-In-The-Loop Rule

AI agents may suggest and implement scoped changes. Humans approve releases, merges to `main`, permission changes, tenant changes and critical operational decisions.

## Documentation

Meaningful changes must update:

- `CHANGELOG.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/CURRENT_DECISIONS.md` when architecture or policy changes
