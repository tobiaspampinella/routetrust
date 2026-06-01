# Beta Stable Criteria

This file is the public-facing summary of the formal beta checklist.

Canonical source:

- [`docs/BETA_STABLE_CRITERIA.md`](docs/BETA_STABLE_CRITERIA.md)

Current interpretation:

- Core admin, driver and customer demo flows must work locally.
- Human approval remains mandatory for critical operational decisions.
- CI must validate install, lint, typecheck, test and build gates.
- Demo behavior must be clearly separated from production claims.
- Secrets, provider tokens and deployment credentials must stay out of version control.

Current blockers still tracked in the canonical document:

- no production database persistence for the main flows
- no Playwright smoke/regression suite
- no `/health` route
- no durable bug report store
- no production-grade map provider abstraction
