# Windows Task Scheduler Setup

The Windows task is prepared but not registered automatically.

Task name:

```text
RouteTrust Autonomous Watchdog
```

Frequency:

```text
Every 30 minutes
```

Action:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/start-autonomous-ops.ps1
```

Register manually from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-windows-task.ps1
```

Unregister manually:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/unregister-windows-task.ps1
```

Stop a currently running daemon process:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stop-autonomous-ops.ps1
```

The scheduled script runs one daemon cycle. It does not leave Codex running every 30 minutes.
