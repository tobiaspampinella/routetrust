# Beta Build Plan

Last updated: 2026-05-30
Target: stable, demonstrable, sellable beta within 7 days.

## Day 1 - Restore And Governance

- Restore ZIP into clean folder.
- Install dependencies with detected package manager.
- Run lint, typecheck, build and smoke.
- Initialize Git safely.
- Refresh governance, ownership, audit and setup docs.

## Day 2 - CMS Core

- Persist CMS baseline.
- Harden CEO/Admin dashboard.
- Confirm RBAC and tenant isolation contracts.
- Add audit logs for critical CMS actions.

## Day 3 - Demo Sandbox And Route Simulation

- Formalize `routeSimulationEngine` event contract.
- Sync operator, driver and customer demo state.
- Add incident and SLA risk timeline.

## Day 4 - Maps And Tracking

- Keep local/MapLibre fallback mandatory.
- Add provider abstraction for Google key mode.
- Document Google TrafficLayer, Routes, 3D and Apple MapKit tradeoffs.

## Day 5 - Telegram And Bug Assistant

- Add Telegram command router and webhook setup.
- Convert assistant into structured bug reporter.
- Route critical bugs to Telegram and ACTIVE_TASKS.

## Day 6 - QA

- Add Playwright critical path tests.
- Run regression and fix critical bugs.
- Update docs and beta checklist.

## Day 7 - Stable Build

- Run final release gates.
- Prepare release notes and changelog.
- Send Telegram stable build update if configured.
- Hand off staging build.
