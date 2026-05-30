# Demo Sandbox Audit

Date: 2026-05-30

## Current State

- `/track/demo` builds and returns 200.
- CMS demo sandbox controls are present in `/admin/cms`.
- Driver surfaces exist at `/driver` and `/driver/route`.
- Customer demo tracking includes moving-truck style projection and local fallback map visuals.
- Tracking simulation logic exists in `src/lib/trackingSimulation.ts`.

## Present Capabilities

- Demo route projection.
- ETA window calculation.
- Traffic factor simulation.
- Driver/truck position interpolation.
- Completion state projection.
- Local fallback without paid map keys.

## Missing For Requested Beta

- Formal `routeSimulationEngine` service with emitted event names.
- Backend persistence for simulation start/pause/completion.
- Shared real-time state across operator, driver and customer views.
- Incident simulation persistence and audit logs.
- Playwright coverage for starting simulation, assigning driver and reporting incident.

## Recommendation

Keep `/track/demo` as the sales-safe demo surface. Next implementation slice should formalize the simulation event contract and persist demo events before adding premium map providers.
