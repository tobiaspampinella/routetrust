# Beta Stable Criteria

English | [Espanol](BETA_STABLE_CRITERIA.es.md)

RouteTrust must separate local demo usefulness from stable beta readiness.

Current cycle:

- `LOCAL_DEMO_READY`: yes when the local app server is running
- `BETA_STABLE_READY`: no while the Git worktree is dirty, even if local checks pass
- `STAGING_READY`: no

## Local Demo Ready

Required:

- `/login` loads
- `/track/demo` loads
- `/admin` is reachable after demo auth
- `npm run lint` passes
- `npm run typecheck` passes
- `npm test` passes

## Beta Stable Ready

Required:

- `npm run build` passes
- Git worktree is clean enough to validate the exact candidate being called stable
- `npm run ux:audit` generates current English and Spanish reports
- browser smoke evidence exists for the critical routes
- `/admin`, `/admin/cms`, `/driver`, `/driver/route`, `/track/demo`, `/login`, `/api/health` and `/admin/project-status` do not return `500`
- no visible mojibake on key product surfaces
- customer tracking is understandable within seconds
- business manager KPIs are readable without guesswork
- bug and project status surfaces do not misstate system readiness
- public docs are bilingual and consistent
- public security docs stay redacted

## Not Enough

- generated reports without verification
- scheduler activity
- agent docs alone
- local demo data alone

## Stable Truth Rule

Do not label the product stable when QA, UX, docs, and runtime evidence disagree.
