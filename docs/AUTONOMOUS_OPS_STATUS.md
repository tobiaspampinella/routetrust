# Autonomous Ops Status

Current design:

- autonomous ops daemon exists
- watchdog uses cheap checks
- task classifier exists
- local model integration is optional through Ollama
- Codex task queue exists
- GitHub sync has a 6 hour cooldown
- safe autofix is limited to low-risk files
- Windows Task Scheduler scripts are prepared

Autonomy is limited. The system can observe, classify, draft safe local outputs and prepare Codex prompts. It cannot merge, release, approve security, perform deploy decisions or claim beta stable without checks.

Primary commands:

```powershell
npm run ops:daemon
npm run watchdog
npm run task:classify
npm run codex:prepare
npm run local:model
npm run safe:autofix
npm run github:sync
```

Primary outputs:

- `runtime/autonomous/watchdog-latest.json`
- `docs/WATCHDOG_REPORT.md`
- `runtime/autonomous/daemon-latest.json`
- `runtime/codex-queue/tasks.json`
- `runtime/codex-queue/next-codex-prompt.md`
