# Agent Runtime Status

Generated: 2026-06-02T19:47:41.290Z

## Scheduler Model

- Local scripts only. No autonomous LLM workers.
- Execution requires schedule plus gating.
- P0 can bypass cooldown. P1 can shorten cooldown. P2 cannot.
- Web tester stays on the 10:00 and 22:00 local windows unless a P0 overrides the gate.
- Backend and frontend agents remain off unless assigned work, urgent bugs or failed checks justify a run.

## Agent Schedule

| Agent | Script | Interval | Cooldown | Last run | Last status | Next decision | Priority |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| codex-node | agents:report | 120 | 90 | 2026-06-01T21:31:36.964Z | EXECUTED | ELIGIBLE | P1 |
| devops-automation-agent | ops:doctor | 240 | 180 | 2026-06-01T19:05:09.744Z | SKIPPED_COOLDOWN | ELIGIBLE | P1 |
| qa-analyst-agent | qa:smoke | 360 | 240 | 2026-06-01T19:05:09.952Z | SKIPPED_COOLDOWN | ELIGIBLE | P1 |
| web-tester-agent | tester:browser | 720 | 480 | 2026-06-01T19:05:10.160Z | SKIPPED_COOLDOWN | SKIPPED_COOLDOWN | P1 |
| backend-developer-agent | backend:audit | 480 | 360 | 2026-06-01T19:05:10.378Z | SKIPPED_COOLDOWN | ELIGIBLE | P2 |
| frontend-developer-agent | frontend:audit | 480 | 360 | 2026-06-01T19:05:10.588Z | SKIPPED_COOLDOWN | ELIGIBLE | P2 |
| ui-ux-product-designer-agent | ux:audit | 1440 | 1200 | 2026-06-01T19:05:10.803Z | SKIPPED_COOLDOWN | ELIGIBLE | P2 |
| cybersecurity-engineer-agent | security:audit | 1440 | 1200 | 2026-06-01T19:05:11.019Z | SKIPPED_COOLDOWN | ELIGIBLE | P2 |
| maps-tracking-agent | maps:audit | 1440 | 1200 | 2026-06-01T19:05:11.240Z | SKIPPED_COOLDOWN | ELIGIBLE | NONE |
| product-gtm-agent | gtm:brief | 4320 | 4320 | 2026-06-01T19:05:11.450Z | SKIPPED_COOLDOWN | SKIPPED_COOLDOWN | NONE |

## Budget

- Executed runs: 128
- Skipped runs: 2124
- Estimated tokens spent: 103400
- Estimated tokens saved: 1946100

## Watchdog Snapshot

- Server: on
- Scheduler: warning
- Last beta-check: 2026-06-02T19:43:56.869Z
- Smoke status: passed

## Immediate Triggers

- P0: build broken, route 500, auth broken, critical bug, data loss, exposed secret, broken tenant isolation.
- P1: smoke failed, CMS broken, driver portal broken, customer tracking broken, assistant broken, GitHub CI broken.
- Manual-only: paid maps activation, feature implementation without assignment, any human approval boundary.
