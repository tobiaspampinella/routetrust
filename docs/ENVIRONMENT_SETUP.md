# Environment Setup

Date: 2026-05-30
Status: restored and build-validated with local workaround

## Machine

- OS: Microsoft Windows 11 Home 10.0.26200
- Git: 2.54.0.windows.1
- Docker: not available on PATH
- PATH Node: blocked by Windows with `Acceso denegado`
- Bundled Node used for validation: `v24.14.0`
- npm used for validation: `11.16.0`, downloaded into `C:\Users\tobii\.codex\tmp\npm-cli`

## Required Local Command Wrapper

Use this PowerShell prefix before npm commands on this PC:

```powershell
$nodeDir='C:\Users\tobii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$node=Join-Path $nodeDir 'node.exe'
$npmCli='C:\Users\tobii\.codex\tmp\npm-cli\package\bin\npm-cli.js'
$env:PATH="$nodeDir;$env:PATH"
```

Then run npm through:

```powershell
& $node $npmCli install --no-audit --no-fund
& $node $npmCli run lint
& $node $npmCli run typecheck
& $node $npmCli run build
& $node $npmCli run dev
```

## Stack Detected

- Frontend: Next.js 15.1.3 App Router, React 19, TypeScript
- Styling: Tailwind CSS 3, custom UI components
- State: Zustand and local mock data
- Backend: Next.js route handlers in `src/app/api`
- Database target: PostgreSQL through Prisma 6
- Cache/queue target: Redis configured in Docker compose
- Auth: HTTP-only cookie flow with local tester users and role middleware
- Maps/tracking: local fallback plus Google Maps provider readiness
- Telegram: protected status/test endpoints, no token committed

## Package Manager

- No lockfile was restored.
- No package manager field exists in `package.json`.
- npm is the selected package manager for the restored project.
- `package-lock.json` was generated during install and should be kept.

## Environment Variables

Required local baseline:

```txt
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
ROUTEPULSE_DEMO_SECRET=
APP_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MAP_PROVIDER=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
NEXT_PUBLIC_OPENROUTE_API_KEY=
NEXT_PUBLIC_APPLE_MAPKIT_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
DEMO_MODE=
NODE_ENV=
```

No real secrets should be committed.
