# FASE 2 - AI Governance

Fecha: 2026-05-31

## Principio Human-In-The-Loop

La IA no toma decisiones finales sobre operaciones criticas. La IA recomienda, simula, clasifica, documenta y asiste.

## La IA Puede

- Sugerir rutas.
- Simular rutas.
- Estimar ETA.
- Detectar riesgo SLA.
- Clasificar bugs.
- Priorizar tareas.
- Generar documentacion.
- Generar tests.
- Asistir soporte.

## Humano Debe Aprobar

- Rutas finales.
- Reasignaciones criticas.
- Cambios de permisos.
- Cambios de tenant.
- Releases.
- Merges a `main`.
- Publicacion de beta stable.

## Reglas Para Agentes

- Codex Node mantiene decisiones y handoffs.
- Antigravity no reemplaza decisiones de arquitectura; entrega auditoria y recomendaciones.
- OpenCode/Vibecode no modifica core sin task y lock.
- QA no corrige features fuera de bugs autorizados.
- UX no cambia flujos core sin task.
- Docs no cambia comportamiento de producto.

## Seguridad

- No hardcodear secretos.
- No mostrar tokens completos en frontend.
- No commitear `.env`.
- No usar APIs premium como requisito para demo.

## Auditoria

Acciones criticas deben registrar:

- actor
- rol
- tenant
- accion
- modulo
- timestamp
- valor anterior
- valor nuevo
- resultado

## Estado

Governance definida. Features nuevas siguen bloqueadas hasta autorizacion.
