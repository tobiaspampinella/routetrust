# Contributing

RouteTrust is developed as an AI-built, human-orchestrated logistics product.

## Working Rules

- Keep scope explicit.
- Do not claim production readiness without evidence.
- Do not add features that bypass human approval or security boundaries.
- Do not publish secrets, local paths, personal credentials, or exploit details.

## Branch Model

- `main`: approved stable builds only
- `develop`: integration work
- `staging`: release validation
- `stabilization/*`: recovery and hardening work
- `agent/*`: isolated agent execution
- `feature/*`: scoped product work
- `fix/*`: scoped bug fixes

Direct pushes to `main` are not allowed in normal work.

## Before Editing

1. Read `docs/ACTIVE_TASKS.md`.
2. Read `docs/NEXT_AGENT_PROMPT.md`.
3. Confirm target files are not effectively blocked by another active task.
4. Keep changes incremental and verifiable.

## Required Checks

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

When the change touches UX, also run:

```bash
npm run ux:audit
```

When the change touches visible flows and Playwright is available, also run:

```bash
npm run qa:smoke
```

## Documentation Obligations

Meaningful changes must update:

- `CHANGELOG.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/ACTIVE_TASKS.md` when ownership or follow-up changes
- relevant docs under `docs/design` or `docs/product` when product behavior or UX changes

## Human Approval Layer

Humans approve:

- releases
- production claims
- security-sensitive changes
- tenant or permission changes
- external integrations
- roadmap priority changes

## Language Standard

Public repository documentation must exist in English and Spanish when it is product-critical or contributor-facing.
