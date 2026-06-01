# Agent Runtime

This repository now has a supervised executable agent runtime. It is not an autonomous multi-agent platform. It is a local Node.js coordination layer that turns the documented agent model into commands, visible state, heartbeats, logs, reports and a runtime JSON dashboard feed.

## Runtime Truth Model

1. Documented agents live in `agents/*`.
2. Executable scripts live in `scripts/*`.
3. Scheduled processes exist only while `agent:scheduler` is running and a scheduler heartbeat exists in `runtime/heartbeats/scheduler.json`.
4. Active processes exist only while a Node.js script is running and a live marker exists in `docs/agent-logs/*.running.json`.

Documentation alone does not mean an agent is working.

## Status Values

- `pending`
- `running`
- `blocked`
- `completed`
- `failed`

Every agent has:

- `mission.md`
- `tasks.md`
- `status.md`
- `output.md`
- `risks.md`

## Commands

```bash
npm run agents:status
npm run agents:report
npm run agents:run -- codex-node
npm run agents:run -- codex-node --hold-ms=30000
npm run agents:qa
npm run agents:telegram
npm run agents:beta-check
npm run dev:dashboard
npm run qa:build
```

## What Can Run As A Real Process

- `node scripts/agent-runner <agent-id>` performs a coordination pass for one agent.
- `node scripts/agent-runner <agent-id> --hold-ms=30000` keeps a real process visible long enough for `agents:status` to detect it from another terminal.
- `node scripts/agent-status` validates runtime files and writes `docs/AGENT_RUNTIME_STATUS.md`.
- `node scripts/agent-scheduler --watch` runs a supervised local loop.
- `node scripts/agent-heartbeat` refreshes per-agent heartbeats in `runtime/heartbeats`.
- `node scripts/watchdog` detects drift, fake completion, lock inconsistency and local runtime blockers.
- `node scripts/locks-sync` and `node scripts/locks-check` keep lock evidence consistent.
- `node scripts/agent-report` writes timestamped reports under `docs/agent-reports`.
- `node scripts/qa-smoke` runs the unit test smoke check.
- `node scripts/qa-build` runs lint, typecheck and build.
- `node scripts/telegram-test` remains available only for explicitly authorized external delivery.
- `node scripts/beta-check` validates required files and runs the unit tests.
- `runtime/project-status.json` is the dynamic data source for `/admin/project-status`.

## What Remains Manual

- No autonomous LLM workers run in the background.
- No scheduler starts these scripts automatically.
- No feature implementation happens inside `agent-runner`.
- Telegram is optional and outside the local operations baseline.
- Product code changes still require explicit human approval and a coding session.
