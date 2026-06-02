# Business Manager Experience Audit

Generated: 2026-06-01

## Verdict

The business manager experience is visually credible but operationally incomplete. A manager can understand the demo story. A manager cannot run the business from it.

## What Works

- Dashboard groups KPIs, risk, routes, incidents and bugs.
- Project status page separates local demo truth from stable readiness.
- Admin routes, drivers, KPIs, CMS, settings and bug reports exist.
- Control tower metaphor is clear.

## What Fails For Real Business Use

- No DB source of truth.
- No tenant switcher backed by permissions.
- No report export.
- No role-scoped views.
- No audit event drilldown.
- No SLA contract model.
- No onboarding checklist for a company.
- No integration state for ecommerce/TMS/ERP.
- No operating day lifecycle: plan, dispatch, monitor, close, reconcile.

## Required Manager Workflows

1. Configure tenant.
2. Invite users.
3. Import routes/orders.
4. Assign drivers.
5. Monitor exceptions.
6. Approve critical route changes.
7. Resolve failed deliveries.
8. Export daily report.
9. Review audit log.
10. Tune SLA and notification rules.

## Priority Tasks

| Priority | Task | Owner | Acceptance |
|---|---|---|---|
| P1 | DB-backed manager dashboard | Backend + Frontend | Dashboard reads tenant data from API |
| P1 | Tenant switcher | Backend + UX/UI | Manager sees only allowed tenants |
| P1 | Approval queue | Backend + UX/UI | Critical changes require persisted approval |
| P2 | Daily close report | Product + Backend | Exportable operational summary |
| P2 | Audit drilldown | Security + Backend | Every critical action has actor/timestamp |
