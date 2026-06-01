# Security

## Status

This project is in beta recovery and stabilization. Security-sensitive changes require human review before release.

## Security Contact

Report vulnerabilities privately to `tobiaspampinella@gmail.com`.

Do not open a public issue when the report contains sensitive details, exploit paths, credentials, customer data or infrastructure information.

## Secrets Policy

- Do not commit `.env`, `.env.local`, provider keys, Telegram tokens, database passwords or JWT secrets.
- Use `.env.example` only for variable names and empty placeholders.
- Frontend code must never display full tokens or secrets.
- Critical credentials belong in deployment secrets or local environment files.
- Do not include tokens, secrets or private keys in screenshots, logs or bug reports.
- Do not commit destructive proof-of-concept artifacts or exploit payloads.

## Required Controls

- RBAC for CMS/Admin actions.
- Tenant isolation for persisted data.
- Audit logs for route, driver, permission, tenant and release actions.
- Human approval for critical operational decisions.

## Security Scope

- auth and session handling
- tenant isolation
- Telegram bot and operational messaging flows
- API keys and provider integrations
- bug report intake and storage
- GitHub Actions and repository automation
- demo credentials and local-only access paths

## Reporting

Report security issues by private email only. Do not publish public issues containing credentials, exploit details or customer data.
