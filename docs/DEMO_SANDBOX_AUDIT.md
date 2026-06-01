# FASE 4 - Demo Sandbox Audit

Fecha: 2026-05-31
Alcance: auditoria solamente. No se implementaron features.

## Que existe

### Vista operador

- `/admin/cms` tab `Enterprise` incluye seccion `Demo sandbox`.
- `/admin/cms` tab `Demo Builder` permite editar copy publico, proveedor de mapa, velocidad de simulacion y paradas demo.
- Acciones sandbox actuales:
  - activar/desactivar demo
  - generar datos demo
  - reiniciar demo
  - iniciar camion
  - pausar simulacion
  - cambiar velocidad
  - simular trafico
  - simular calle bloqueada
  - simular retraso
  - simular entrega completada
  - simular entrega fallida

### Vista driver

- `/driver` muestra ruta asignada, avance, proxima parada, KPIs basicos y CTA.
- `/driver/route` permite iniciar, marcar llegada, marcar entregado, marcar fallido, pausar y reanudar.
- Driver portal esta protegido por middleware para role `driver`.

### Vista cliente

- `/track/demo` muestra tracking cliente con ETA, camion, paradas anonimizadas, estado de pedido, soporte y nota de privacidad.
- Si `customerTrackingEnabled` esta apagado, muestra mensaje de tracking desactivado.

### Simulacion

- `src/lib/trackingSimulation.ts` calcula:
  - elapsed seconds
  - traffic factor
  - stop duration
  - live ETA
  - projection route/packages/order
  - truck position
  - route status
- `src/store/routePulseStore.ts` controla inicio, pausa y reinicio de simulation.
- `src/components/customer/FleetTrackingMap.tsx` renderiza Google Maps si hay key y fallback local si no.

## Que falta

- `routeSimulationEngine` formal como service/event engine.
- Persistencia de eventos de sandbox.
- Estado compartido real entre admin, driver y customer.
- WebSockets o polling controlado.
- Backend para start/pause/reset/incident/delivery events.
- Separacion estricta entre sandbox state y ops state.
- Tests de flujo completo.
- Replay de simulacion.
- Export de eventos demo.
- Integracion con approval workflow real.

## Que esta roto o riesgoso

- Varias strings visibles tienen mojibake por encoding.
- Las acciones sandbox escriben estado local o React state, no backend.
- `generateSandbox` comunica "5 rutas, 5 drivers y 50 clientes", pero no crea entidades productivas persistidas.
- `resetSandbox` llama `resetDemo()` y puede afectar todo el estado mock global, no solo sandbox scoped.
- `LiveCmsTab` puede mutar rutas mock directamente; no pasa por approval real.
- La seccion sandbox y el demo builder viven en el mismo componente CMS grande.
- No hay prueba automatizada que garantice que `/track/demo` no filtra datos de otros clientes.

## Que se puede reutilizar

- `CustomerTrackingDemo`
- `FleetTrackingMap`
- `CustomerTrackingMap3D`
- `DriverMap`
- `trackingSimulation.ts`
- `demoMapCoordinates.ts`
- `trackingCms` dentro de `RoutePulseData`
- Acciones de `routePulseStore` como comportamiento demo inicial.
- Eventos sandbox definidos en `CmsDemoSandboxEvent`.

## Que NO debe tocarse

- No eliminar fallback local.
- No bloquear `/track/demo` por falta de API key.
- No mezclar estado demo con rutas productivas cuando se implemente backend.
- No conectar proveedor pago sin env, billing y terminos aprobados.
- No convertir simulaciones en decisiones automaticas sin Human Approval Layer.

## Tareas por agente

| Agente | Tareas |
| --- | --- |
| Codex Node | Definir contrato de eventos sandbox y secuencia de implementacion. |
| Full Stack Agent | Persistir DemoSandboxConfig y DemoSandboxEvent. |
| QA Agent | Cubrir start/pause/reset/traffic/failure/customer tracking. |
| UX/UI Agent | Separar operator sandbox de demo builder y limpiar encoding. |
| Maps Agent | Validar fallback, Google real y MapLibre readiness. |
| Telegram Agent | Preparar notificaciones de eventos sandbox criticos. |
| Bug Assistant Agent | Permitir reportar bug desde sandbox sin mezclar con operaciones. |
| Docs Agent | Mantener spec de eventos alineada con tipos. |

## Orden de implementacion recomendado

1. Corregir encoding visible.
2. Congelar contrato de eventos sandbox.
3. Crear tests smoke del sandbox actual.
4. Extraer panels UI sin cambio funcional.
5. Persistir eventos sandbox.
6. Sincronizar admin/driver/customer con backend.
7. Integrar approval real para acciones criticas.
8. Integrar Telegram y bug assistant sobre eventos persistidos.
