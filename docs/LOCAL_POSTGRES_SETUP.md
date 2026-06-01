# Local Postgres Setup

This machine is currently blocked for Docker-based local Postgres:

- `docker` is not installed
- `psql` is not installed
- `localhost:5432` is not serving PostgreSQL

## Option A: Docker Desktop

1. Install Docker Desktop.
2. Start Docker Desktop.
3. From the repo root run:

```powershell
npm run db:up
```

4. Verify port `5432` is listening.
5. Copy [`.env.local.example`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\.env.local.example) to `.env.local`.
6. Run:

```powershell
npm run db:validate
npx prisma migrate dev --name init_routetrust_core
npm run db:seed
```

## Option B: Manual PostgreSQL install

1. Install PostgreSQL 16 locally.
2. Create:
   - database: `routetrust_local`
   - user: `routetrust`
   - password: `routetrust_local_password`
3. Ensure PostgreSQL listens on `localhost:5432`.
4. Copy [`.env.local.example`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\.env.local.example) to `.env.local`.
5. Run:

```powershell
npm run db:validate
npx prisma migrate dev --name init_routetrust_core
npm run db:seed
```

## Expected connection string

```env
DATABASE_URL=postgresql://routetrust:routetrust_local_password@localhost:5432/routetrust_local?schema=public
```

## Current blocker code

`DB_LOCAL_BLOCKED_NO_DOCKER`
