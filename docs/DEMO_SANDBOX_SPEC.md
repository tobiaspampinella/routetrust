# Demo Sandbox Spec - RoutePulse AI

Fecha: 2026-05-27

## Objetivo

El Demo Sandbox debe ser un entorno comercial seguro para mostrar RoutePulse AI sin modificar datos productivos. Debe permitir simular una operacion de ultima milla con ruta, driver, camion, cliente, ETA, SLA, trafico, incidentes y aprobaciones humanas.

## Posicionamiento

RoutePulse AI es una plataforma **AI-built, human-orchestrated Operational Intelligence Platform for logistics operations**.

El sandbox no debe comunicar que la IA reemplaza operadores. Debe demostrar que el sistema sugiere, estima y detecta riesgo, mientras el humano aprueba decisiones criticas.

## Vistas

### Vista Operador

Ubicacion actual: `/admin/cms` en tab `Enterprise > Demo sandbox` y `Demo Builder`.

Debe mostrar:

- estado sandbox
- ruta activa
- camion/driver simulado
- ETA y SLA risk
- trafico simulado
- incidentes
- panel de aprobacion humana
- timeline de eventos
- acciones seguras de simulacion

Acciones beta:

- activar/desactivar demo
- resetear datos demo
- generar datos ficticios
- iniciar simulacion de camion
- pausar simulacion
- modificar velocidad
- simular trafico
- simular calle bloqueada
- simular retraso
- simular entrega completada
- simular entrega fallida

### Vista Driver

Ubicacion actual:

- `/driver`
- `/driver/route`

Debe permitir:

- login driver demo
- ver ruta asignada
- iniciar ruta
- marcar llegada
- marcar entregado
- reportar entrega fallida/incidencia
- pausar/reanudar
- finalizar ruta cuando no quedan paradas

### Vista Cliente Final

Ubicacion actual:

- `/track/demo`

Debe mostrar:

- tracking simplificado
- ETA en ventana
- estado de pedido
- ubicacion aproximada
- mensaje de incidencia si aplica
- privacidad: no mostrar datos de otros clientes

## Mapa y tracking

Estado actual:

- fallback local 2.5D con camion animado
- Google Maps provider-ready con `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

Beta recomendada:

- mantener fallback local estable
- activar Google Maps real solo cuando haya API key legal
- agregar MapLibre/OpenStreetMap como siguiente proveedor si se acepta dependencia externa
- no bloquear la beta por Google Photorealistic 3D Tiles

## Modelo de ruta demo

Ruta conceptual:

```ts
type RoutePoint = {
  lat: number;
  lng: number;
  elevation?: number;
  speedLimit?: number;
  trafficLevel?: "low" | "medium" | "high";
  streetStatus?: "clear" | "traffic" | "blocked" | "incident";
  checkpointType?: "pickup" | "delivery" | "waypoint";
};
```

La beta actual usa `TrackingDemoStop` con `lat/lng`, `trafficLevel`, `dropoffMinutes` y `priority`.

## Eventos sandbox

Eventos minimos:

- sandbox_generated
- simulation_started
- simulation_paused
- speed_changed
- traffic_simulated
- street_blocked
- delay_simulated
- delivery_completed
- delivery_failed
- incident_created
- route_approval_requested
- route_approved_by_human
- route_rejected_by_human

Cada evento debe mostrarse en timeline y generar audit log CMS cuando ocurre desde admin.

## Human Approval Layer

Acciones que requieren decision humana:

- aprobacion final de ruta sugerida
- reasignacion critica
- cancelacion de ruta
- cambio de SLA
- cambio de permisos
- cambio de tenant
- configuracion operacional critica

En sandbox, el sistema puede simular una sugerencia. El operador debe hacer click en aprobar/rechazar/modificar para cerrar la decision.

## Limitaciones beta

- No hay backend real.
- No hay WebSockets.
- El estado se guarda localmente con Zustand/localStorage o estado React local segun modulo.
- Telegram test depende de env server.
- El trafico puede ser simulado si no hay proveedor configurado.
- Google Maps real requiere API key y terminos/billing configurados.
