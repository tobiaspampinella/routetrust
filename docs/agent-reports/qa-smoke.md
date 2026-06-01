# QA Smoke Report

Generated: 2026-06-01T01:52:23.958Z

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
✔ createBugReport builds a durable ticket shape with category and agents (3.0432ms)
✔ routeBugReport escalates security tickets correctly (0.5218ms)
✔ buildPageContext detects driver route pages (1.6881ms)
✔ classifyAssistantRequest routes security issues to security validation (1.0529ms)
✔ classifyAssistantRequest keeps public support contextual without forced ticketing (0.4491ms)
✔ buildProjectIntelligenceReport exposes beta core status without secrets (3.6603ms)
✔ renderProjectIntelligenceMessage is compact and operational (0.9547ms)
✔ buildDemoRouteSimulation returns a stable beta snapshot (3.3044ms)
✔ createRouteSimulationEvent creates auditable event payloads (1.9124ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 554.0466

```

## Stderr

```text

```
