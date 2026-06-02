# Token Usage Policy

Generated: 2026-06-01

## Purpose

Spend high-capability model work only where it changes correctness, safety or architecture.

## Use Local/Scripts First

Use scripts for:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run beta-check`
- `npm run qa:smoke`
- `npm run qa:security`
- `npm run project:status`
- `npm run agents:status`

Use local model for:

- summaries
- duplicate issue grouping
- doc drift detection
- first-pass translation review

## Use GPT-5.5/Codex For

- architecture changes
- DB migration
- auth/RBAC
- security reviews
- flaky test root cause
- deploy blockers
- production readiness
- final audit synthesis

## Escalation Rules

Escalate immediately if:

- command fails with unknown root cause
- security or secrets are involved
- tenant isolation is involved
- production/staging deploy is involved
- data loss is possible
- release claim is being made

## Waste Rules

- Do not run heavy audits on unchanged files.
- Do not ask LLMs to repeat script output.
- Do not use high-capability models for formatting-only docs.
- Do not use any model to declare beta stable without command evidence.
