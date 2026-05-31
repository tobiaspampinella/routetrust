# Security - Beta SaaS Controlada v0.1

## Current Security Status

This beta is not production-ready. It has working demo protections but still carries security blockers.

Verified dependency status:

- `npm audit --omit=dev --audit-level=critical` passes after Next.js/PostCSS dependency refresh.

## Required Before Public Release

- Keep production dependency audit free of critical vulnerabilities.
- Remove silent production default for session/JWT secrets.
- Keep `.env` and `.env.local` out of Git.
- Add tests for auth token creation/verification and invalid credentials.
- Add rate limiting or equivalent login abuse protection.
- Persist audit logs for critical changes.
- Centralize tenant resolution and enforce tenant scope in persisted APIs.

## Secrets Policy

- `.env.example` may list variable names only.
- Do not commit real database URLs, Telegram tokens, map provider keys, JWT/session secrets or customer data.
- Frontend code may use only `NEXT_PUBLIC_*` values intended for browser exposure.
- Server-only tokens must stay server-side.

## Auth Notes

Current auth is demo-grade:

- Local test users are stored in code.
- Middleware protects `/admin` and `/driver`.
- CMS roles are richer than login roles and are not backed by persisted identity.

Next hardening step:

- Fail explicitly in production if `ROUTEPULSE_DEMO_SECRET` or future session secret is missing.
- Keep local beta usable in development.

## Tenant Notes

Tenant IDs are currently demo-scoped and partly hardcoded. This is acceptable only for local beta. It is not acceptable for commercial production.
