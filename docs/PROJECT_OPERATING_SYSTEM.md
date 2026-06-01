# FASE 2 - Project Operating System

Fecha: 2026-05-31
Proyecto: RoutePulse AI / RouteTrust
Modo: AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

## Objetivo

Crear un sistema operativo de proyecto para que Codex, Antigravity, OpenCode/Vibecode, QA, UX y Docs trabajen sin pisarse.

## Jerarquia Operativa

1. Codex Node coordina governance, arquitectura, integracion y handoffs.
2. Antigravity/Gemini apoya auditoria operacional, UX enterprise y analisis de producto.
3. OpenCode/Vibecode apoya testing, fixtures, mocks y bugs pequenos.
4. QA valida gates y regresiones.
5. UX/UI valida experiencia admin, demo y driver.
6. Docs mantiene specs, changelog y handoff.

## Reglas Anti-Conflicto

- Revisar `docs/ACTIVE_TASKS.md` antes de tocar archivos.
- Revisar ownership en `docs/AGENT_OWNERSHIP.md`.
- Registrar archivos bloqueados en `FILES_LOCKED` antes de editar.
- No tocar archivos bloqueados por otro agente.
- No hacer refactor global.
- No cambiar arquitectura sin entrada en `docs/CURRENT_DECISIONS.md`.
- No avanzar features si `lint`, `typecheck` o `build` estan rotos sin documentarlo.
- Todo cambio significativo actualiza `docs/CHANGELOG.md`.
- Todo handoff actualiza `docs/NEXT_AGENT_PROMPT.md`.

## Branch Strategy Sugerida

- `main`: estable aprobado.
- `develop`: integracion.
- `staging`: pre-release.
- `agent/codex-node`: governance, arquitectura, integracion.
- `agent/fullstack-core`: CMS, backend, RBAC, route engine.
- `agent/qa-stability`: tests, webtester, regression.
- `agent/ux-admin`: admin dashboard, demo UX, driver UX.
- `agent/maps-research`: maps fallback, Google Maps research, traffic integration.
- `agent/telegram-bot`: Telegram bot, project updates.
- `agent/bug-assistant`: internal bug chatbot, bug routing.
- `agent/docs`: README, specs, changelog.

## Fases Permitidas

Estado actual: FASE 2 governance.

No implementar features hasta que el usuario autorice fase funcional.

## Definition Of Ready Para Implementar

- Tarea registrada en `ACTIVE_TASKS`.
- Agente asignado.
- Branch sugerida definida.
- Archivos bloqueados declarados.
- Dependencias y riesgos declarados.
- Gate minimo conocido: install/lint/typecheck/build.
