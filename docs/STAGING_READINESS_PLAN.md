# Staging Readiness Plan

## Target

Railway plus PostgreSQL.

## Preconditions

- `typecheck`, `lint`, `test`, `build`, `qa:smoke`, `qa:security` passing on a controlled branch.
- Prisma migration executed against a real Postgres instance.
- `AUTH_SECRET`, `DATABASE_URL`, app URL and map envs defined.
- Health endpoint reports DB and persistence honestly.

## Required env contract

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_TILE_URL`
- `OSRM_BASE_URL`
- `OPENROUTE_API_KEY` when used

## First staging gate

1. Deploy app.
2. Run migration.
3. Run seed only for demo sandbox environments.
4. Hit `/api/health`.
5. Run smoke against staging URL.

## Current status

MISSING. No verified staging deployment exists.
