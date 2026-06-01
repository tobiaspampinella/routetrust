# Demo Sandbox Spec

Fecha: 2026-05-31
Estado: especificacion basada en auditoria FASE 4.

## Objetivo

El Demo Sandbox debe permitir mostrar una operacion de ultima milla sin tocar datos productivos. Debe simular rutas, driver, camion, ETA, trafico, incidentes, entregas y aprobaciones humanas.

## Superficies

### Operador

Ubicacion actual:

- `/admin/cms`
- Tab `Enterprise`, seccion `Demo sandbox`
- Tab `Demo Builder`

Debe permitir:

- Activar o desactivar sandbox.
- Generar datos ficticios.
- Reiniciar solo datos demo.
- Iniciar y pausar camion.
- Cambiar velocidad.
- Simular trafico.
- Simular calle bloqueada.
- Simular retraso.
- Simular entrega completada.
- Simular entrega fallida.
- Crear approval request demo.
- Ver timeline de eventos.

### Driver

Ubicacion actual:

- `/driver`
- `/driver/route`

Debe permitir:

- Ver ruta asignada.
- Iniciar ruta.
- Marcar llegada.
- Marcar entrega completada.
- Marcar entrega fallida con motivo.
- Pausar con motivo.
- Reanudar.
- Ver paradas restantes.

### Cliente

Ubicacion actual:

- `/track/demo`

Debe mostrar:

- ETA en ventana.
- Estado del pedido.
- Camion o ubicacion aproximada.
- Paradas anonimizadas.
- Ultimo evento.
- Soporte.
- Nota de privacidad.

## Modelo de evento

Cada evento sandbox debe tener:

- id
- tenantId
- sandboxId
- type
- actorId
- actorRole
- payload
- result
- createdAt

Eventos minimos:

- `sandbox_generated`
- `simulation_started`
- `simulation_paused`
- `speed_changed`
- `traffic_simulated`
- `street_blocked`
- `delay_simulated`
- `delivery_completed`
- `delivery_failed`
- `incident_created`
- `route_approval_requested`
- `route_approved_by_human`
- `route_rejected_by_human`

## Estado de sandbox

Campos minimos:

- enabled
- status: `empty`, `ready`, `running`, `paused`
- truckSimulation: `idle`, `running`, `paused`
- speedMultiplier
- trafficScenario: `normal`, `rush_hour`, `blocked_street`, `incident_delay`
- activeIncident
- delayMinutes
- completedDeliveries
- failedDeliveries
- pendingApprovals
- lastGeneratedAt

## Guardrails

- Sandbox no modifica datos productivos.
- Acciones criticas crean approval request.
- Cliente no ve nombres ni direcciones de otras paradas.
- Fallback local debe funcionar sin API keys.
- Si Google Maps falla, vuelve a fallback local.
- MapLibre no se declara como implementado hasta instalar dependencia y provider real.

## Criterios de aceptacion beta

- `/track/demo` funciona sin secrets.
- Admin puede iniciar/pausar/reiniciar demo.
- Driver puede procesar parada mock.
- Cliente ve ETA actualizada.
- Evento critico queda registrado.
- Fallo de proveedor de mapa no rompe demo.
- No hay datos productivos mezclados con sandbox.
- Tests smoke cubren al menos un flujo admin-driver-customer.

## Dependencias no implementadas

- Backend sandbox API.
- Persistencia DB.
- WebSocket/polling real.
- MapLibre real.
- Telegram event routing.
- Bug report routing.
