# Beta Check Report

Generated: 2026-06-03T12:04:31.230Z

STATUS: LOCAL_DEMO_READY

## Classification

- LOCAL_DEMO_READY: YES
- DB_LOCAL_READY: NO
- BETA_STABLE_READY: NO
- STAGING_READY: NO
- Runtime aligned: YES

## Passed Checks

- typecheck
- lint
- unit_tests
- build
- qa_smoke
- prisma_validate
- locks_check
- watchdog
- bug_triage
- health_200
- login_no_500
- admin_no_500
- admin_cms_no_500
- track_demo_no_500
- driver_no_500
- driver_route_no_500
- admin_project_status_no_500
- persistent_storage_files
- database_health
- bug_reports_db_backed
- runtime_churn_policy
- runtime_aligned

## Failed Checks

- prisma_migration_exists
- github_push_synced
- git_worktree_clean

## Blockers

- Prisma migration has not been created yet.
- GitHub push is pending for branch implementation/real-saas-core: upstream origin/implementation/real-saas-core
- Git worktree is dirty (53 entries). Stable cannot be claimed on an unvalidated dirty tree.

## HTTP Checks

- /api/health -> 200
- /login -> 200
- /admin -> 307
- /admin/cms -> 307
- /track/demo -> 200
- /driver -> 307
- /driver/route -> 307
- /admin/project-status -> 307
- /api/cms/telegram/status -> 401

## Environment Reality

- Git remote origin: https://github.com/tobiaspampinella/routetrust.git
- Current branch: implementation/real-saas-core
- Git push sync: pending
- Git upstream: origin/implementation/real-saas-core
- Git ahead count: 10
- Git behind count: 0
- Git worktree clean: no
- Git dirty preview:  M .gitignore |  M docs/AGENT_RUNTIME_STATUS.md |  M docs/BUG_TRIAGE_REPORT.md |  M docs/LOCKED_FILES.md |  M docs/QA_SECURITY_REPORT.md |  M docs/SECURITY_AUDIT.md |  M docs/agent-reports/beta-check.md |  M docs/agent-reports/qa-smoke.md |  M docs/agent-reports/watchdog.md |  M next-env.d.ts |  M package.json |  M scripts/agent-status
- Silent demo secret fallback: not detected
- Critical bug reports: 0
- Telegram configured: no
- Official port 3000 PIDs: 11076
- Secondary port 3001 PIDs: none
- Official process ownership clear: yes
- Process command line access: available
- Database health: ok
- Persistence mode: db
- Prisma migrations: missing

## Command Results

### Typecheck

```text
package script "typecheck": tsc --noEmit -p tsconfig.typecheck.json
```

Exit code: 0

```text


```

### Lint

```text
package script "lint": cross-env ESLINT_USE_FLAT_CONFIG=false eslint . --ext .js,.jsx,.ts,.tsx --cache
```

Exit code: 0

```text

(node:6416) ESLintRCWarning: You are using an eslintrc configuration file, which is deprecated and support will be removed in v10.0.0. Please migrate to an eslint.config.js file. See https://eslint.org/docs/latest/use/configure/migration-guide for details. An eslintrc configuration file is used because you have the ESLINT_USE_FLAT_CONFIG environment variable set to false. If you want to use an eslint.config.js file, remove the environment variable. If you want to find the location of the eslintrc configuration file, use the --debug flag.
(Use `node --trace-warnings ...` to show where the warning was created)

```

### Unit Tests

```text
package script "test": tsx --test src/lib/*.test.ts
```

Exit code: 0

```text
✔ createBugReport builds a durable ticket shape with category and agents (1.8982ms)
✔ routeBugReport escalates security tickets correctly (0.472ms)
✔ buildPageContext detects driver route pages (1.0392ms)
✔ classifyAssistantRequest routes security issues to security validation (1.6347ms)
✔ classifyAssistantRequest keeps public support contextual without forced ticketing (0.9037ms)
✔ classifyAssistantRequest routes driver UX blockers to UX and engineering (0.5571ms)
✔ buildProjectIntelligenceReport exposes beta core status without secrets (3.4899ms)
✔ renderProjectIntelligenceMessage is compact and operational (0.7594ms)
✔ buildDemoRouteSimulation returns a stable beta snapshot (2.4273ms)
✔ createRouteSimulationEvent creates auditable event payloads (1.0892ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 207.6666


```

### Build

```text
package script "build": cross-env ROUTEPULSE_DIST_DIR=.next-build next build
```

Exit code: 0

```text
   ▲ Next.js 15.5.18
   - Environments: .env.local, .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.0s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/35) ...
   Generating static pages (8/35) 
   Generating static pages (17/35) 
   Generating static pages (26/35) 
 ✓ Generating static pages (35/35)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                    Size  First Load JS
┌ ○ /                                       5.96 kB         120 kB
├ ○ /_not-found                                1 kB         103 kB
├ ○ /admin                                  11.5 kB         139 kB
├ ○ /admin/approvals                        3.77 kB         146 kB
├ ○ /admin/audit-logs                       2.87 kB         134 kB
├ ○ /admin/bug-reports                      1.61 kB         129 kB
├ ○ /admin/cms                              20.6 kB         155 kB
├ ○ /admin/drivers                          4.92 kB         147 kB
├ ○ /admin/incidents                        4.59 kB         147 kB
├ ○ /admin/kpis                             6.98 kB         135 kB
├ ○ /admin/project-status                   1.61 kB         129 kB
├ ○ /admin/routes                           6.91 kB         135 kB
├ ○ /admin/settings                         4.01 kB         132 kB
├ ƒ /api/agents                               167 B         103 kB
├ ƒ /api/assistant                            167 B         103 kB
├ ƒ /api/auth/login                           167 B         103 kB
├ ƒ /api/auth/logout                          167 B         103 kB
├ ƒ /api/auth/me                              167 B         103 kB
├ ƒ /api/bugs                                 167 B         103 kB
├ ƒ /api/bugs/[bugId]                         167 B         103 kB
├ ƒ /api/bugs/[bugId]/route                     0 B            0 B
├ ƒ /api/cms/telegram/project-intelligence    167 B         103 kB
├ ƒ /api/cms/telegram/status                  167 B         103 kB
├ ƒ /api/cms/telegram/test                    167 B         103 kB
├ ƒ /api/health                               167 B         103 kB
├ ○ /cms                                      167 B         103 kB
├ ○ /contact                                5.46 kB         120 kB
├ ○ /demo                                     167 B         103 kB
├ ○ /driver                                 6.31 kB         146 kB
├ ○ /driver/route                               0 B            0 B
├ ○ /login                                  4.72 kB         130 kB
├ ○ /product                                2.77 kB         117 kB
├ ○ /track/demo                             5.48 kB         137 kB
├ ○ /updates                                 4.7 kB         119 kB
└ ○ /use-cases                              2.77 kB         117 kB
+ First Load JS shared by all                102 kB
  ├ chunks/1255-b28ea36bf0cdbd65.js         46.2 kB
  ├ chunks/4bd1b696-f785427dddbba9fb.js     54.2 kB
  └ other shared chunks (total)                2 kB


ƒ Middleware                                34.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand



```

### Smoke Browser

```text
package script "qa:smoke": node scripts/qa-smoke-runtime.js
```

Exit code: 0

```text
✔ createBugReport builds a durable ticket shape with category and agents (2.6245ms)
✔ routeBugReport escalates security tickets correctly (0.5027ms)
✔ buildPageContext detects driver route pages (1.2063ms)
✔ classifyAssistantRequest routes security issues to security validation (1.339ms)
✔ classifyAssistantRequest keeps public support contextual without forced ticketing (0.6134ms)
✔ classifyAssistantRequest routes driver UX blockers to UX and engineering (0.2412ms)
✔ buildProjectIntelligenceReport exposes beta core status without secrets (3.0436ms)
✔ renderProjectIntelligenceMessage is compact and operational (0.4231ms)
✔ buildDemoRouteSimulation returns a stable beta snapshot (2.2386ms)
✔ createRouteSimulationEvent creates auditable event payloads (1.3021ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 204.1259
QA smoke completed.
Report: docs/agent-reports/qa-smoke.md


```

### Prisma Validate

```text
npx prisma validate: npx prisma validate
```

Exit code: 0

```text
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀

warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Environment variables loaded from .env

```
