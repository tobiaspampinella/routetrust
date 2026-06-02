# Persistence Strategy

Goal: minimum durable local persistence without pretending production DB readiness.

Current durable files:

- `data/runtime/bug-reports.json`
- `data/runtime/bug-dispatches.json`
- `data/runtime/audit-log.json`
- `data/runtime/project-events.json`

Rules:

- runtime JSON files are the source of truth, not process memory
- files are created on demand
- writes use a temp file plus rename fallback
- bug reports survive server restarts
- audit events record bug intake and Telegram checks

Non-goal:

- this is not a substitute for a production database
