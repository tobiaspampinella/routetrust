# Agent Runtime Status

Generated: 2026-06-03T12:03:46.879Z

## Runtime Truth Model

1. documented: folder and agent docs exist.
2. executable: runner-based commands exist.
3. scheduled: local scheduler heartbeat is alive.
4. running: a real process marker is active.
5. blocked: runtime detected an external or structural blocker.
6. completed: task evidence is complete for the current pass.
7. failed: validation or command execution failed.

Documentation does not mean an agent is actively working.

## Agent Status

| Agent | Status | Mode | Active process | Tasks | Pending tasks |
| --- | --- | --- | --- | ---: | ---: |
| codex-node | pending | executable | none | 2 | 1 |
| fullstack-engineer | completed | executable | none | 1 | 0 |
| qa-analyst | completed | executable | none | 1 | 0 |
| operational-auditor | pending | executable | none | 0 | 0 |
| demo-engineer | pending | executable | none | 0 | 0 |
| maps-agent | completed | executable | none | 1 | 0 |
| telegram-agent | completed | executable | none | 1 | 0 |
| bug-assistant-agent | completed | executable | none | 1 | 0 |
| docs-agent | completed | executable | none | 1 | 0 |
| ux-ui-agent | pending | executable | none | 2 | 1 |
| fullstack-debug-agent | pending | executable | none | 1 | 1 |
| qa-security-agent | pending | executable | none | 1 | 1 |
| local-bug-assistant-agent | pending | executable | none | 1 | 1 |
| ux-agent | pending | executable | none | 0 | 0 |
| fullstack-bug-fix-agent | pending | executable | none | 0 | 0 |
| qa-validation-agent | pending | executable | none | 0 | 0 |
| cybersecurity-validation-agent | pending | executable | none | 0 | 0 |
| bug-triage-agent | pending | executable | none | 0 | 0 |
| local-website-assistant-agent | pending | executable | none | 0 | 0 |

## Active Processes

- none

## Stale Process Markers

- scheduler: stale marker docs/agent-logs/scheduler.running.json

## Tasks From docs/ACTIVE_TASKS.md

| ID | Agent | Status | Module | Next step |
| --- | --- | --- | --- | --- |
| CORE-001 | Codex Node | completed | Beta Core / Governance / Integration | Replanificar tareas activas para backend real, persistencia y hardening de stable build. |
| FS-002 | Full Stack Agent | completed | CMS / Route Engine / Incidents | Implement persistent API/DB, starting with the minimum durable backend path. |
| QA-002 | QA Agent | completed | Tests / Regression | Add browser smoke tests for admin, driver and tracking. |
| UX-002 | UX/UI Agent | completed | Admin Dashboard / Driver UX | Fix remaining encoding and add UX smoke tests. |
| MAPS-002 | Maps Agent | completed | Maps Fallback | Evaluar e integrar proveedor real de mapas/trafico bajo criterio legal y tecnico. |
| TG-002 | Telegram Agent | completed | Telegram Project Intelligence Bot | Telegram descartado temporalmente; no continuar esta linea hasta nueva decision. |
| BUG-002 | Bug Assistant Agent | completed | Bug Reporting Assistant | Persist bug reports and add admin queue over real backend storage. |
| DOCS-002 | Docs Agent | completed | Changelog / Criteria / Handoff | Add smoke evidence in next stable-build hardening phase. |
| OPS-003 | Codex Node | pending | Runtime supervision / Scheduler / Watchdog | Keep scheduler, watchdog and beta-check aligned around the local operations baseline. |
| UXR-003 | UX/UI Agent | pending | Project status dashboard / Demo / Driver / Customer | Run `npm run ux:audit` after the project status page is dynamic. |
| DBG-003 | Full Stack Debug Agent | pending | Runtime routes / APIs / Demo / Tracking | Run `npm run debug:scan`. |
| SEC-003 | QA Security Agent | pending | Auth / RBAC / Secrets / Protected routes | Run `npm run qa:security`. |
| LBA-003 | Local Bug Assistant Agent | pending | Local bug assistant / Bug queue / Routing | Run `npm run bugs:triage`. |

## Runtime Validation

Missing files:

- none

Invalid statuses:

- none

## Manual Work Boundary

- The runtime is supervised and local.
- It does not create autonomous LLM workers.
- Product implementation still requires an explicit coding session.
- Telegram is optional and outside the local operations baseline.
