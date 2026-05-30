# Installation Report

Date: 2026-05-30
Owner: Principal AI Node Orchestrator

## Commands Executed

```powershell
node --version
npm --version
git --version
docker --version
```

PATH result:

- `node.exe`: access denied from WindowsApps Codex path.
- `npm`, `pnpm`, `yarn`, `corepack`: not found.
- Docker: not found.

Temporary npm bootstrap:

```powershell
Invoke-RestMethod https://registry.npmjs.org/npm/latest
tar -xzf npm-latest.tgz
node npm-cli.js --version
```

Install and checks:

```powershell
npm install --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
npm run dev
```

## Installation Result

- First `npm install` failed because Prisma scripts called blocked `node` from PATH.
- Second `npm install` passed after prepending bundled Node to PATH.
- npm added 469 packages and generated `package-lock.json`.

## Warnings

- `next@15.1.3` has an npm security warning and must be upgraded in a dedicated hardening task.
- `recharts@2.x` is deprecated and should be upgraded after beta stabilization.
- npm reported install scripts pending approval for Prisma, Sharp, esbuild and related packages. Because build passed, this is not blocking local recovery but should be reviewed.

## Verification Results

- `npm run lint`: passed, no ESLint warnings or errors.
- `npm run typecheck`: initially failed on `prisma/seed.ts`; fixed an implicit `any`, then passed.
- `npm run build`: passed.
- Dev server: started at `http://localhost:3000`.
- Smoke HTTP:
  - `/`: 200
  - `/login`: 200
  - `/admin`: redirected to login and returned 200
  - `/admin/cms`: redirected to login and returned 200
  - `/driver`: redirected to login and returned 200
  - `/track/demo`: 200
  - `/api/cms/telegram/status`: 401 without auth, expected for protected CMS endpoint

## Final State

Recovery install is operational. The project can lint, typecheck, build and run locally when commands use the explicit bundled Node PATH.
