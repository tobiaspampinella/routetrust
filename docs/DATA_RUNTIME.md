# Runtime Data

Versioned schema targets:

- `bug-reports.json`: `{ "reports": BugReport[] }`
- `bug-dispatches.json`: `{ "records": DispatchRecord[] }`
- `audit-log.json`: `{ "records": RuntimeAuditEntry[] }`
- `project-events.json`: `{ "records": ProjectEventEntry[] }`

Operational rule:

- if a file is missing, the runtime creates it
- if a file is unreadable, health and beta-check must surface the failure
