# Runtime Files Policy

Versioned:

- `agents/*/mission.md`
- `agents/*/tasks.md`
- structural docs under `docs/`
- scripts
- `package.json`

Runtime-only:

- `runtime/heartbeats/*`
- `runtime/logs/*`
- `runtime/project-status.json`
- `runtime/local-ops-status.json`
- `docs/agent-logs/*`
- generated runtime reports

Rule:

- runtime churn must not be used as evidence of product progress
- runtime-only files must be ignored by git
