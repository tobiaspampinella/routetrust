# Security

## Disclosure Status

This project is in beta. Public security documentation is intentionally redacted.

## Private Reporting

Do not open a public issue for vulnerabilities that include:

- credentials
- exploit paths
- customer or tenant data
- infrastructure details
- tokens
- local machine details

Use a private disclosure channel controlled by the repository owner or designated security maintainer.

## Repository Rules

- Do not commit `.env` files or secrets.
- Do not publish tokens, API keys, chat IDs, passwords, or session material.
- Do not include exploit payloads, attack walkthroughs, or destructive proof-of-concept artifacts.
- Do not expose unnecessary personal contact data in public docs.

## Minimum Controls

- protected admin and CMS routes
- explicit auth state
- durable auditability for sensitive actions
- tenant boundary preservation
- human approval for critical operational actions

## Security Scope

- auth and session handling
- admin and CMS access control
- bug intake storage
- runtime and agent supervision
- optional Telegram and map-provider integrations

## Out of Scope Claims

This document does not claim certification, penetration-test completion, or production security readiness.
