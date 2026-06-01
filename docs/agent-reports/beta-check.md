# Beta Check Report

Generated: 2026-06-01T03:15:59.955Z

STATUS: completed

## Runtime Validation

- Missing required beta files: 0
- Missing runtime files: 0
- Invalid status files: 0
- Active processes: 1
- Telegram configured: no

## Missing Required Files

- none

## Command Results

### Tests

```text
package script "test": tsx --test src/lib/*.test.ts
```

Exit code: 0

```text
✔ createBugReport builds a durable ticket shape with category and agents (2.0562ms)
✔ routeBugReport escalates security tickets correctly (0.4112ms)
✔ buildPageContext detects driver route pages (1.0739ms)
✔ classifyAssistantRequest routes security issues to security validation (1.8436ms)
✔ classifyAssistantRequest keeps public support contextual without forced ticketing (0.8249ms)
✔ classifyAssistantRequest routes driver UX blockers to UX and engineering (0.4718ms)
✔ buildProjectIntelligenceReport exposes beta core status without secrets (2.5989ms)
✔ renderProjectIntelligenceMessage is compact and operational (0.5608ms)
✔ buildDemoRouteSimulation returns a stable beta snapshot (1.8603ms)
✔ createRouteSimulationEvent creates auditable event payloads (1.3631ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 220.6061


```

### Locks

```text
package script "locks:check": node scripts/locks-check
```

Exit code: 0

```text
Active locks: 0
Inconsistencies: 0


```

### Watchdog

```text
package script "watchdog:once": node scripts/watchdog
```

Exit code: 0

```text
Watchdog issues: 0


```

### Bug Triage

```text
package script "bugs:triage": node scripts/bugs-triage
```

Exit code: 0

```text
Triaged bug reports: 4
Critical bug reports: 0


```
