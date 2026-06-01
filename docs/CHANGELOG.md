# Docs Changelog

## 2026-06-01 - Runtime stabilization pass

- Removed generated Next artifact folders before validation.
- Decoupled base `tsconfig.json` from `.next/types` and `.next-app/types`.
- Revalidated `npm test`, `npm run typecheck`, and `npm run build` from a clean `.next`.
- Normalized Telegram status/test endpoint responses for missing env without returning `500`.
- Added `docs/STABILIZATION_REPORT.md`.
- Added `docs/HTTP_SMOKE_REPORT.md`.
- Updated QA, tech debt, and next-agent handoff docs with stabilization evidence.

## 2026-06-01 - Supervised Runtime Hardening

- Agregados scheduler, heartbeat, watchdog, sync/check de locks, Telegram status/notify y triage local de bugs.
- Agregados agentes de runtime: UX/UI, Full Stack Debug, QA Security y Local Bug Assistant.
- Agregado `runtime/project-status.json` como fuente dinamica del dashboard operativo.
- Convertida `/admin/project-status` para leer estado real del runtime.
- Agregada cola local `/admin/bug-reports`.

## 2026-05-31 - FASE 5 Beta Core Implementation

- Implementado corte beta minimo sobre el tester existente.
- Agregado `npm run test` con `tsx --test`.
- Agregados contratos puros testeados:
  - `src/lib/routeSimulationEngine.ts`
  - `src/lib/projectIntelligence.ts`
  - `src/lib/bugReporting.ts`
- Agregado CEO beta overview al admin.
- Agregado incident reporting basico desde driver.
- Agregado endpoint basico `/api/bugs`.
- Agregado endpoint `/api/cms/telegram/project-intelligence`.
- Corregida cookie de auth para que `next start` en localhost conserve sesion por HTTP.
- Actualizados `CHANGELOG.md`, `docs/ACTIVE_TASKS.md`, `docs/NEXT_AGENT_PROMPT.md` y `docs/BETA_STABLE_CRITERIA.md`.

## 2026-05-31 - FASE 2 Governance Multiagente

- Actualizado `docs/PROJECT_OPERATING_SYSTEM.md`.
- Actualizado `docs/AI_GOVERNANCE.md`.
- Actualizado `docs/ACTIVE_TASKS.md` con formato obligatorio.
- Actualizado `docs/AGENT_OWNERSHIP.md`.
- Actualizado `docs/BETA_BUILD_PLAN.md`.
- Actualizado `docs/CURRENT_DECISIONS.md`.
- Actualizado `docs/NEXT_AGENT_PROMPT.md`.
- Definidos agentes principales: Codex Node, Full Stack, QA, UX/UI, Maps, Telegram, Bug Assistant y Docs.
- Definidos support agents: Antigravity/Gemini y OpenCode/Vibecode.
- Definidas reglas anti-conflicto y ramas sugeridas.
- No se implementaron features.

## 2026-05-31 - FASE 1 Install + Build Validation

- Ejecutado `npm install --no-audit --no-fund` con npm.
- Ejecutado `npm run lint`; resultado OK.
- Ejecutado `npm run typecheck`; resultado OK.
- Documentado que `npm run test` no existe.
- Ejecutado `npm run build`; resultado OK.
- No se implementaron features.
- No se hizo refactor.
