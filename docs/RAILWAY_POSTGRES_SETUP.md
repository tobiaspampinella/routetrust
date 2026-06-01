# Railway Postgres Setup

## Objective

Provision the first real hosted Postgres for RouteTrust staging without hardcoding credentials.

## Steps

1. Create a Railway project.
2. Add PostgreSQL.
3. Copy the generated connection string into the app service as `DATABASE_URL`.
4. Set `AUTH_SECRET` and app URL env vars.
5. Run migrations from the deployment pipeline or a controlled shell.

## Required commands

```powershell
npx prisma validate
npx prisma generate
npx prisma migrate deploy
```

## Rules

- Do not commit Railway credentials.
- Do not seed production tenants with demo users.
- Do not declare staging ready until smoke passes against the Railway URL.
