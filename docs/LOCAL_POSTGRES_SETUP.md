# Local PostgreSQL Setup

RouteTrust uses PostgreSQL for the local SaaS baseline. Do not switch the
Prisma provider to MySQL for local convenience; that would create a second data
contract instead of a portable implementation baseline.

## Automated Bootstrap

```powershell
npm run db:bootstrap
```

What it does:

- Creates ignored local `.env` and `.env.local` files when missing.
- Sets a local PostgreSQL `DATABASE_URL`.
- Sets local non-production auth secrets.
- Uses Docker Compose when Docker is available.
- Uses native `psql` when PostgreSQL is installed.
- Applies committed Prisma migrations with `prisma migrate deploy`.
- Seeds demo tenant data.

If PostgreSQL is not installed and Docker is unavailable:

```powershell
npm run db:bootstrap:portable
```

That downloads official EDB PostgreSQL 16 Windows binaries into ignored
`runtime/postgres/`, initializes a user-space data directory and starts Postgres
on port `55432`.

If you specifically want the Windows service installer:

```powershell
npm run db:bootstrap:install
```

That command attempts a non-interactive PostgreSQL 16 install through winget.
Windows may require elevated permissions for that installer.

If you have Docker Desktop or Docker Engine installed, prefer
`docker-compose.yml` and run `npm run db:up` instead.

## 1. Install PostgreSQL 16

### Windows (native, no Docker)

Option A: official installer
1. Download PostgreSQL 16 from <https://www.postgresql.org/download/windows/>.
2. Run the installer. Use the password `routetrust_local_password` for the
   `postgres` superuser (or any password; just keep the value below in sync).
3. Use port `55432` for RouteTrust local development.
4. In the "Stack Builder" step you can uncheck everything; we do not need
   additional tooling.

Option B: portable / winget
```powershell
winget install PostgreSQL.PostgreSQL.16
```

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install -y postgresql-16
sudo systemctl enable --now postgresql
```

## 2. Create the local database and user

Connect as the `postgres` superuser:

```bash
psql -U postgres
```

Then run:

```sql
CREATE USER routetrust WITH PASSWORD 'routetrust_local_password';
CREATE DATABASE routetrust_local OWNER routetrust;
GRANT ALL PRIVILEGES ON DATABASE routetrust_local TO routetrust;
\q
```

If your local `postgres` user authenticates via `peer` on Linux, prefix the
commands with `sudo -u postgres`:

```bash
sudo -u postgres psql -c "CREATE USER routetrust WITH PASSWORD 'routetrust_local_password';"
sudo -u postgres psql -c "CREATE DATABASE routetrust_local OWNER routetrust;"
```

## 3. Configure the local environment

Copy `.env.local.example` to `.env.local` and adjust the values:

```bash
cp .env.local.example .env.local
```

Required variable:

```
DATABASE_URL=postgresql://routetrust:routetrust_local_password@127.0.0.1:55432/routetrust_local?schema=public
```

`AUTH_SECRET` and `ROUTEPULSE_DEMO_SECRET` may stay empty for local development.

## 4. Validate Prisma and apply migrations manually

```bash
npm run db:validate
npm run db:migrate:deploy
npm run db:seed
```

## 5. Verify

```bash
npm run qa:smoke
npm run beta-check
```

`/api/health` should now report:

- `database: connected`
- `storageMode: db`
- `bugStore: ok`

## 6. Troubleshooting

- `psql: error: connection to server ... Connection refused` — the service is
  not running. On Linux, run `sudo systemctl start postgresql`. On macOS,
  `brew services start postgresql@16`. On Windows, open `services.msc` and
  start the `postgresql-x64-16` service.
- `password authentication failed for user "routetrust"` — the password in
  step 2 does not match the one in `.env.local`. Re-run step 2 with the same
  password and update `.env.local`.
- `permission denied for schema public` — re-run the `GRANT ALL PRIVILEGES`
  statement from step 2, then reconnect.
- Prisma still complains about `DATABASE_URL` — confirm `.env.local` exists in
  the project root and that the value has no surrounding quotes or spaces.

## 7. Reset

To drop the local database and recreate it from scratch:

```sql
DROP DATABASE routetrust_local;
CREATE DATABASE routetrust_local OWNER routetrust;
```

Then re-run `npx prisma migrate dev`.
