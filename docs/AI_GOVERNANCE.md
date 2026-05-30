# AI Governance

Last updated: 2026-05-30

## Product Position

RoutePulse AI is AI-built with human strategic oversight. It assists logistics teams with operational intelligence; it does not replace human operators.

## AI May Suggest

- Routes
- Driver assignments
- ETA changes
- SLA risk
- Incident classification
- Bug priority
- Demo data and simulation states

## Human Must Approve

- Final route approval
- Critical reassignment
- Permission and role changes
- Tenant changes
- Production release
- Merge to `main`
- Stable build publication

## Agent Boundaries

- Agents can audit, document, implement scoped tasks and run checks.
- Agents cannot expose secrets.
- Agents cannot bypass RBAC/tenant checks.
- Agents cannot auto-approve critical operational actions.
- Agents cannot add premium provider dependencies that break missing-key mode.
- Agents cannot run destructive refactors during restore.

## Audit Log Requirement

Critical actions must record actor, role, tenant, action, module, timestamp, previous value, new value and result. IP/user agent should be added where available.
