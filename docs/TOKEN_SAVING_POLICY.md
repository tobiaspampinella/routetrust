# Token Saving Policy

RouteTrust uses tokens only where high judgment is required.

## Codex GPT-5.5 Reserved For

- P0 breakage.
- P1 beta-stable blockers.
- DB.
- Auth.
- Security.
- Deploy.
- RBAC.
- Tenant isolation.
- Architecture.
- Final readiness judgments.

## Local Model Or Backlog For

- P2 UX notes.
- Documentation drift.
- Copy.
- EN/ES translation drafts.
- Log summaries.
- Checklist drafts.
- Issue grouping.
- Microcopy.

## Watchdog Cost Controls

- Runs cheap checks every 30 minutes.
- Runs `npm run beta-check -- --cheap`, not the full beta gate.
- Does not run full build by default.
- Does not run Codex unless `CODEX_AUTORUN=1` or `--run-codex` is explicitly set.
- Does not run Prisma migrations.
- Does not push to GitHub.
- Does not retry network failures until the configured cooldown.
- Full `npm run beta-check` stays in post-change validation and release readiness only.

## Real Codex Execution

- `npm run codex:run` executes one queued P0/P1 task.
- `npm run ops:daemon:codex` executes the daemon cycle and then the next queued Codex task.
- The runner invokes `codex exec` with `--sandbox danger-full-access` and `--ask-for-approval never`.
- The runner still runs prechecks, postchecks and a single logical commit.
- Merge and release approval remain outside automation.

## GitHub Sync Cost Controls

- Runs separately.
- Has a 6 hour cooldown.
- Skips when there are no local commits.
- Blocks on dirty worktree.
- Uses `git push origin HEAD`.
- Never force pushes.
