# Bug Reporting Assistant

Fecha: 2026-05-31
Estado: auditoria y especificacion objetivo. No implementado como assistant durable.

## Estado actual

Existe:

- `src/components/shared/CxAssistantWidget.tsx`
- Montado en `AdminShell`.
- Chat local con reglas simples.
- Puede:
  - responder a keywords de trafico/ETA
  - disparar `recalculateRouteEta("route-001")`
  - registrar un "bug" solo dentro de mensajes locales
  - marcar P1 solo en la sesion local
  - resumir paquetes pendientes/entregados desde store

## Que falta

- Modelo `BugReport`.
- API para crear bug report.
- Persistencia.
- Admin queue.
- Severidad real.
- Categoria real.
- Archivo/ruta afectada.
- Reproduccion.
- Evidencia adjunta.
- Estado workflow.
- Routing por agente.
- Notificacion Telegram para P0/P1.
- Vinculo a tasks en `docs/ACTIVE_TASKS.md`.
- Proteccion anti-spam.
- Export o audit.

## Que esta roto o riesgoso

- El widget se presenta como inbox QA/CX, pero no guarda nada fuera del estado React.
- `Marcar como P1` no tiene efecto fuera de la sesion.
- La accion de recalcular ETA muta ruta mock desde chat.
- No hay permisos especificos para usar acciones del assistant.
- No hay audit log.
- No hay tests.

## Reutilizable

- UI flotante del widget.
- Deteccion simple de intencion como placeholder local.
- Integracion con `useRoutePulseStore` para leer resumen operativo.
- Patron de acciones con boton dentro de mensaje.

## Especificacion objetivo

Campos `BugReport`:

- id
- tenantId
- createdBy
- source: `admin`, `driver`, `customer`, `qa`, `system`
- module
- routePath
- title
- description
- severity: `P0`, `P1`, `P2`, `P3`
- category: `bug`, `ux`, `data`, `performance`, `security`, `integration`
- reproductionSteps
- expectedResult
- actualResult
- evidenceUrls
- status: `new`, `triaged`, `assigned`, `in_progress`, `fixed`, `rejected`
- assignedAgent
- createdAt
- updatedAt

APIs objetivo:

- `POST /api/bugs`
- `GET /api/bugs`
- `PATCH /api/bugs/:bugId`
- `POST /api/bugs/:bugId/route`

Routing objetivo:

- `security` o secrets -> Codex Node + QA Agent.
- `maps` -> Maps Agent.
- `telegram` -> Telegram Agent.
- `driver`/`customer` UX -> UX/UI Agent + QA Agent.
- `backend`/`cms` -> Full Stack Agent.
- `docs` -> Docs Agent.

## Que NO debe tocarse

- No conectar LLM externo sin seguridad y privacidad.
- No permitir mutaciones operativas desde assistant sin permission + audit.
- No notificar Telegram P0/P1 hasta existir deduplicacion.
- No mezclar bugs reales con mensajes de demo customer tracking.

## Orden de implementacion

1. Definir modelo y API.
2. Crear admin queue.
3. Convertir widget en intake form/chat controlado.
4. Agregar audit log.
5. Agregar routing por agente.
6. Agregar notificacion Telegram para P0/P1.
7. Agregar tests.
