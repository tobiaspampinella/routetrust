# Autonomous Ops Status

Status: configured as controlled local automation.

## Current Truth

- Full autonomy: NO. Controlled execution: YES.
- Local watchdog: YES.
- Optional local model: YES, enabled when Ollama exposes a configured model.
- Codex CLI direct execution: YES.
- Codex task queue: YES.
- Main protection by policy: YES.
- Human release approval: REQUIRED.
- Token-saving P2 routing: YES.

## Runtime Files

- Watchdog output: `runtime/autonomous/watchdog-latest.json`
- Daemon output: `runtime/autonomous/daemon-latest.json`
- Cheap beta signal: `runtime/reports/beta-check-cheap-latest.json`
- Codex queue: `runtime/codex-queue/tasks.json`
- Next Codex prompt: `runtime/codex-queue/next-codex-prompt.md`
- Local model config: `runtime/local-model/config.json`
- GitHub sync state: `runtime/github-sync/state.json`

## Commands

```powershell
npm run ops:daemon
npm run watchdog
npm run beta-check -- --cheap
npm run task:classify
npm run codex:prepare
npm run codex:run
npm run codex:run:dry
npm run ops:daemon:codex
npm run local:model
npm run safe:autofix
npm run github:sync
npm run preflight
npm run postcheck
```

## Operational Boundary

The daemon classifies and prepares work. It runs Codex only when started with `--run-codex` or `CODEX_AUTORUN=1`; otherwise it stays in cheap watchdog mode.

`npm run codex:run` executes exactly one pending P0/P1 task, runs prechecks, invokes `codex exec`, runs postchecks and commits a logical task commit when checks pass.
