# DB Setup

## Local Postgres

1. Start PostgreSQL on `localhost:5432`.
2. Create database `routetrust`.
3. Copy `.env.example` to `.env.local`.
4. Set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/routetrust
AUTH_SECRET=replace-with-a-real-random-secret
```

## Validation commands

```powershell
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init_real_saas_core
npx prisma db seed
```

## Success condition

`GET /api/health` returns HTTP 200 and includes `"db": "ok"`.
