# Environment Setup Audit

Date: 2026-05-30
Workspace: `<local-project-path>`

## Public-Safe Summary

- The project is operated from a local workspace and validated with a local Node/npm toolchain.
- `npm` is the active package manager because `package-lock.json` is present.
- The app uses Next.js in `src/app` and includes API routes under `src/app/api`.
- Prisma is present for future persistence work.

## Environment Contract

`.env.example` documents the expected variables for:

- app URLs
- database and cache connections
- session and auth secrets
- map-provider configuration
- Telegram integration
- demo mode flags

## Operational Note

Machine-specific runtime paths, wrapper commands, and workstation diagnostics are tracked privately.
