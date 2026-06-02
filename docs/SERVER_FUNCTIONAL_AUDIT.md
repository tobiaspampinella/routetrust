# Server Functional Audit

Generated: 2026-06-01
Audit role: Server Functional Auditor Agent

## Verdict

The app runs locally in dev and production modes. It is not server-ready for real SaaS because health is degraded without production env, persistence writes to local filesystem, Prisma cannot validate without `DATABASE_URL`, and staging is missing.

## Local Runtime

- Official dev URL: `http://127.0.0.1:3000`.
- Listener: port 3000, PID 20792.
- `/api/health` returned HTTP 200 with body status `degraded`.
- Runtime data files exist under `data/runtime`.

## Build

`npm run build` passed.

Next.js generated 27 app routes. Build artifacts use custom dist dir `.next-build` through `ROUTEPULSE_DIST_DIR`.

## Start

`npm run start -- -p 3002` started successfully after build.

Production `/login` returned 200.

Production `/api/health` returned:

```json
{"status":"degraded","environment":"production","checks":{"server":"ok","storage":"ok","bugStore":"ok","telegram":"out_of_scope","maps":"fallback","auth":"missing","runtime":"degraded"}}
```

Impact: start works, but production health is not acceptable.

## Deployment Readiness

| Target | Can run today | Verdict |
|---|---:|---|
| Vercel | partial | Next app can build; local filesystem writes and missing env contract are blockers |
| Railway | partial | Better fit for Next + Postgres; still needs DB env, migrations and storage migration |
| Render | partial | Can host Node app and Postgres; same DB/env/storage blockers |
| VPS | partial | Most permissive for local filesystem, but still requires process manager, secrets, DB, backup and observability |

## What Fails If Uploaded Today

- Prisma validation fails unless `DATABASE_URL` is configured.
- Health remains degraded without production auth secret.
- Local JSON writes are unsafe on serverless and weak on container redeploys.
- No staging URL or deploy evidence.
- No DB migrations workflow wired into deploy.
- No production logs/metrics/tracing contract.

## OneDrive / Local Windows Dependency

The repository is inside OneDrive. Local runtime and file paths rely on `process.cwd()` and repo-relative `data/runtime`, `.next-build`, `.next-dev` and `runtime`. This works locally but is not a durable SaaS storage model.

## Runtime Local Dependencies

- `data/runtime/*.json`
- `runtime/project-status.json`
- port 3000 convention
- local Node processes
- local scripts as operational source of truth

## Required Server Fixes

1. Define mandatory production env contract.
2. Move runtime data to Postgres.
3. Use `prisma migrate deploy` in deploy pipeline.
4. Add staging URL.
5. Add server logs and request IDs.
6. Remove filesystem as source of truth.
7. Make `/api/health` fail or degrade on precise production blockers.

Relevant authoritative docs:

- Next.js deployment: https://nextjs.org/docs/app/getting-started/deploying
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- Railway Next.js + Postgres guide: https://docs.railway.com/guides/nextjs
- Render Next.js docs: https://render.com/docs/deploy-nextjs-app
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Prisma production migrations: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
