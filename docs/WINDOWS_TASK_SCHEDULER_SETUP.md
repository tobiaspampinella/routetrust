# Windows Task Scheduler Setup

Prepared task name:

```text
RouteTrust Autonomous Watchdog
```

Frequency:

```text
Every 30 minutes
```

Action:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-autonomous-ops.ps1
```

## Register

Run from the project root only when local automation should be enabled:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-windows-task.ps1
```

## Unregister

```powershell
powershell -ExecutionPolicy Bypass -File scripts/unregister-windows-task.ps1
```

## Manual Cycle

```powershell
npm run ops:daemon
```

## Manual Cycle With Codex Execution

```powershell
npm run ops:daemon:codex
```

## Enable Codex For Scheduled Cycles

Set `CODEX_AUTORUN=1` in the task environment before registering or run the
daemon with `--run-codex` manually. Without that setting, the scheduled task
keeps Codex disabled and only runs the cheap watchdog cycle.

## Stop Active Daemon Process

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop-autonomous-ops.ps1
```

The scheduler is not registered automatically by the repository. Registration is
explicit because it creates a Windows-level recurring task.
