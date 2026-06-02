# Token Budget Policy

## Core Rule

Do not spend tokens or heavy local resources when nothing relevant changed.

## Enforcement

- No fake autonomous workers.
- No heavy hourly audits by default.
- Backend and frontend agents do not run without assigned work, urgent bugs or failed checks.
- P0 breaks cooldown.
- P1 can shorten cooldown.
- P2 respects full cooldown.
- Watchdog stays cheap and never launches heavy agent suites.
- Telegram is reserved for P0 detected, build failed, smoke failed, beta-check failed, stable build achieved, daily summary and manual request.

## Execution Evidence

- `runtime/agent-schedule.json` defines interval, cooldown and script ownership.
- `runtime/agent-budget.json` tracks estimated spend and savings.
- `runtime/agent-last-run.json` tracks last real execution plus last evaluation.
- `runtime/reports/*-latest.json` stores per-agent execution evidence.
- `docs/agent-reports/*-latest.md` stores human-readable summaries.

## Savings Logic

- Executed run: increment `tokensSpentEstimate`.
- Skipped run: increment `tokensSavedEstimate`.
- Skip counts are useful only if skips are anchored to real gating, not fake cooldown churn.

## Anti-Burn Constraints

- Runtime-generated noise does not qualify as meaningful Git drift.
- A skipped evaluation must not reset the agent cooldown clock.
- Change detection is filtered per agent by relevant watch paths plus shared operational files.
