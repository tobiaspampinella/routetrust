# Codex Real Execution

RouteTrust can execute queued Codex tasks through the local Codex CLI.

## Commands

```powershell
npm run codex:run:dry
npm run codex:run
npm run ops:daemon:codex
```

## Runtime Contract

- Executes one pending P0/P1 task per run.
- Uses `codex exec`.
- Uses `--sandbox danger-full-access`.
- Uses `--ask-for-approval never`.
- Runs task prechecks before Codex.
- Runs task postchecks after Codex.
- Creates one logical commit when checks pass.
- Blocks `.env`, private keys, certificates and secret material.
- Does not merge to `main`.
- Does not force push.

## Scheduler

The 30 minute watchdog does not execute Codex by default. To enable Codex for a
scheduled cycle, set:

```powershell
$env:CODEX_AUTORUN = "1"
```

Then run:

```powershell
npm run ops:daemon
```

Use this only for concrete P0/P1 tasks. P2 stays local-model/backlog work.
