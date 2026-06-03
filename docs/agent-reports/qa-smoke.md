# QA Smoke Report

Generated: 2026-06-03T12:04:20.406Z

STATUS: completed

## Required Files

- none missing

## Command

```text
package script "test": tsx --test src/lib/*.test.ts
```

Exit code: 0

## Stdout

```text
✔ createBugReport builds a durable ticket shape with category and agents (2.6245ms)
✔ routeBugReport escalates security tickets correctly (0.5027ms)
✔ buildPageContext detects driver route pages (1.2063ms)
✔ classifyAssistantRequest routes security issues to security validation (1.339ms)
✔ classifyAssistantRequest keeps public support contextual without forced ticketing (0.6134ms)
✔ classifyAssistantRequest routes driver UX blockers to UX and engineering (0.2412ms)
✔ buildProjectIntelligenceReport exposes beta core status without secrets (3.0436ms)
✔ renderProjectIntelligenceMessage is compact and operational (0.4231ms)
✔ buildDemoRouteSimulation returns a stable beta snapshot (2.2386ms)
✔ createRouteSimulationEvent creates auditable event payloads (1.3021ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 204.1259

```

## Stderr

```text

```
