# Next Agent Prompt

## 2026-06-01 Database/Prisma pass handoff (OpenCode fallback)

Completed in this pass:

- aligned `docker-compose.yml` with the spec (container name, named volume)
- added `docs/LOCAL_POSTGRES_SETUP.md` with the manual install path
- added `docs/DB_LOCAL_STATUS.md` with honest snapshot and decision log
- confirmed `prisma/schema.prisma` already covers Tenant/User/Driver/Route/RouteStop/AuditLog/BugReport
- confirmed `bugStore.ts`, `/api/health`, `scripts/beta-check` already implement the DB/file_fallback gates
- did not invent `DATABASE_URL` or fake a Postgres connection (Docker unavailable in this environment)

Current blockers (unchanged in this environment, code is ready):

- no Docker/Postgres reachable from this shell
- no `DATABASE_URL` in the worktree (`.env.local` is gitignored, by design)
- no `prisma/migrations/` directory yet
- no seed run yet

Do not claim autonomous agents.

Next priority order:

1. developer with Docker: `npm run db:up && npx prisma migrate dev --name init_routetrust_core && npm run db:seed`
2. developer without Docker: follow `docs/LOCAL_POSTGRES_SETUP.md`
3. re-run `npm run beta-check` and update `docs/DB_LOCAL_STATUS.md` with `DB_LOCAL_READY: YES`
4. hand off RBAC and tenant isolation work to Backend Real Agent

## 2026-06-01 RouteTrust scheduler hardening handoff

Completed in this pass:

- aligned the local scheduler with the non-autonomous RouteTrust model
- tightened change detection so each agent watches only relevant paths plus shared operational files
- stopped skipped evaluations from resetting cooldown and last real execution timestamps
- synchronized agent prompts, schedule docs and token budget policy with the actual runtime model
- kept watchdog cheap and daily summary local-day aware

Current blockers:

- `docs/ACTIVE_TASKS.md` still contains legacy agent names outside the ten scheduled base agents
- the worktree is already dirty, so broad repo drift still exists even with per-agent filtering
- beta stability still depends on product and QA blockers unrelated to scheduler control

Do not claim autonomous agents.

Next priority order:

1. normalize legacy task ownership aliases in `docs/ACTIVE_TASKS.md` and `config/routeTrustAgents.json`
2. verify `watchdog`, `agent:runner`, `agent:priority`, `agent:cooldown` and `ops:daily-summary` outputs after state regeneration
3. keep only cheap scheduled audits unless a P0 or P1 signal justifies escalation
