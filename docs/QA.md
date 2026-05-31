# QA - Beta SaaS Controlada v0.1

## Automated Checks

Use the local Node/npm wrapper from `docs/ENVIRONMENT_SETUP.md` on this Windows machine.

```powershell
$nodeDir='C:\Users\tobii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$node=Join-Path $nodeDir 'node.exe'
$npmCli='C:\Users\tobii\.codex\tmp\npm-cli\package\bin\npm-cli.js'
$env:PATH="$nodeDir;$env:PATH"
& $node $npmCli run typecheck
& $node $npmCli test
& $node $npmCli run lint
& $node $npmCli run build
& $node $npmCli audit --omit=dev
```

Latest Phase 0 evidence:

- Typecheck: passing.
- Unit tests: passing, 6 tests.
- Lint: passing.
- Build: passing.
- Audit: `npm audit --omit=dev --audit-level=critical` passing after Next.js/PostCSS dependency refresh.
- Dev server: running at `http://127.0.0.1:3000`.
- HTTP smoke: `/login` 200, `/track/demo` 200, `/admin` 307 redirect to login.

## Manual Smoke Checklist

Run:

```powershell
& $node $npmCli run dev
```

Expected URL:

```txt
http://localhost:3000
```

Smoke routes:

- `/` loads landing without runtime crash.
- `/login` loads login form.
- `/admin` redirects unauthenticated users to `/login?next=/admin`.
- Login with `admin@demo.com` / `admin123`, then `/admin` loads dashboard.
- `/admin/cms` loads CMS beta modules.
- `/driver` redirects unauthenticated users to login.
- Login with `driver1@demo.com` / `driver123`, then `/driver` loads driver home.
- `/track/demo` loads public tracking demo without exposing admin controls.

## Missing QA Coverage

- No Playwright suite yet.
- No API integration test for auth routes.
- No persistence tests because production persistence is not wired.
- No route-level smoke automation in CI yet.

## QA Rule

No phase is complete if typecheck, tests, lint and build were not executed in the same cycle. Audit failures can remain only when explicitly tracked as security issues.
