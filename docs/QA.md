# QA - Beta SaaS Controlada v0.1

## Automated Checks

Run the standard project commands from the repository root:

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm audit --omit=dev
```

Latest QA runtime evidence:

- Typecheck: passing.
- Unit tests: passing, 10 tests.
- Lint: passing.
- Build: passing.
- Audit: `npm audit --omit=dev --audit-level=critical` passing after Next.js/PostCSS dependency refresh.
- Browser smoke: passing in real Chromium through `npm run qa:smoke`.
- Health: `/api/health` 200.
- Runtime report: `docs/PLAYWRIGHT_RUNTIME_REPORT.md`.

## Manual Smoke Checklist

Run:

```bash
npm run dev
```

Expected URL:

```txt
http://localhost:3000
```

Smoke routes:

- `/` loads landing without runtime crash.
- `/login` loads login form.
- `/admin` redirects unauthenticated users to `/login?next=/admin`.
- Login with the local demo admin account documented in `docs/DEMO_LOCAL_ONLY.md`, then `/admin` loads dashboard.
- `/admin/cms` loads CMS beta modules.
- `/driver` redirects unauthenticated users to login.
- Login with a local demo driver account documented in `docs/DEMO_LOCAL_ONLY.md`, then `/driver` loads driver home.
- `/track/demo` loads public tracking demo without exposing admin controls.

## Remaining QA Gaps

- No CI evidence is attached here for remote or staging browser smoke.
- No dedicated auth-route integration suite exists beyond the current smoke coverage.
- No persistence migration test exists for a future non-file-store backend.

## QA Rule

No phase is complete if typecheck, tests, lint and build were not executed in the same cycle. Audit failures can remain only when explicitly tracked as security issues.
