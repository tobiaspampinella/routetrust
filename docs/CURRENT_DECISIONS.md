# FASE 5/6 - Current Decisions

Fecha: 2026-06-01

## Decisiones Governance

- Codex Node es el agente coordinador principal.
- Antigravity/Gemini queda como apoyo de auditoria operacional, UX enterprise y analisis.
- OpenCode/Vibecode queda como apoyo para testing, fixtures, mocks y bugs pequenos.
- Todo trabajo debe registrarse en `docs/ACTIVE_TASKS.md`.
- Todo ownership se rige por `docs/AGENT_OWNERSHIP.md`.
- Todo conflicto de archivos se resuelve por `FILES_LOCKED`.
- La autorizacion de FASE 5 queda ampliada a ejecucion total de stable build.
- Se autoriza implementar arquitectura real, no solo demo local.
- Se autoriza abrir backend, persistencia, hardening y pruebas de beta estable.

## Autorizaciones Humanas Vigentes

- `prisma/schema.prisma` queda aprobado para implementacion y migraciones controladas.
- Queda autorizada de forma explicita y total la construccion de API/DB persistente.
- Queda autorizado el scope total de FASE 5 para salir del mock local.
- Queda aprobada la evaluacion legal de cualquier proveedor con API gratuita utilizable para mapa con trafico.
- Telegram queda descartado por el momento y no bloquea el trabajo actual.

## Decisiones Branch

- Mantener `main` como estable aprobado.
- Usar `develop` para integracion.
- Usar `staging` para pre-release.
- Usar ramas `agent/*` por agente.

## Decisiones Anti-Conflicto

- Ningun agente edita archivos bloqueados.
- Ningun agente modifica core sin registrar decision.
- Ningun agente mezcla package managers.
- Ningun agente commitea secretos.
- Todo agente deja evidencia en docs.

## Modulos Siguientes, No Implementados

- CMS persistence.
- Backend contracts.
- RBAC.
- Route engine.
- Tests/webtester.
- Admin/demo/driver UX.
- Maps fallback and research.
- Telegram bot.
- Bug assistant.
- Docs public polish.

## Estado

Governance definida. Backend real, persistencia y stable build autorizados. Telegram fuera de alcance inmediato.
