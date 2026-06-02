# Next Agent Prompt

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
