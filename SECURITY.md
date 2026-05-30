# Security

## Supported Status

This repository is in beta recovery and stabilization. Security-sensitive changes require human review before release.

## Secrets

- Do not commit `.env`, `.env.local` or real provider keys.
- Telegram, map, database and JWT secrets must stay in environment variables.
- Frontend must never display full tokens.

## Reporting

Report security issues privately to the project owner. Do not open public issues containing credentials, exploit details or customer data.

## Required Controls

- RBAC checks for CMS/admin actions.
- Tenant isolation for persisted data.
- Audit logs for critical route, permission, tenant and release actions.
- Human approval for critical operational decisions.
