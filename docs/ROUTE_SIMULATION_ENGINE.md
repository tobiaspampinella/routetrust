# Route Simulation Engine

Fecha: 2026-05-31
Estado: auditoria y contrato objetivo. No implementado como engine formal.

## Estado actual

Existe simulacion dispersa en:

- `src/lib/trackingSimulation.ts`
- `src/lib/etaCalculations.ts`
- `src/lib/kpiCalculations.ts`
- `src/store/routePulseStore.ts`
- `src/components/admin/CmsEnterpriseOverview.tsx`
- `src/components/customer/FleetTrackingMap.tsx`

Capacidades actuales:

- Calculo de ETA.
- Calculo de riesgo.
- Proyeccion de stops.
- Interpolacion de camion.
- Factor de trafico demo.
- Start/pause/restart de tracking demo.
- Entrega/fallo/pausa de rutas mock.

## Problema

No existe un `routeSimulationEngine` unico. La logica esta repartida entre librerias puras, Zustand store y componente CMS.

## Contrato objetivo

El engine debe exponer funciones puras para simulacion y una capa de comando para persistencia/eventos.

Funciones puras:

- `buildSimulationProjection(input)`
- `calculateTrafficFactor(stops, elapsedSeconds)`
- `estimateStopDuration(stop, context)`
- `calculateTruckPosition(route, progress)`
- `deriveRouteStatus(events)`
- `deriveCustomerEta(order, route, events)`

Comandos:

- `startSimulation`
- `pauseSimulation`
- `changeSpeed`
- `simulateTraffic`
- `simulateBlockedStreet`
- `simulateDelay`
- `markDeliveryCompleted`
- `markDeliveryFailed`
- `createIncident`
- `requestRouteApproval`

Eventos emitidos:

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

## Reutilizable

- `buildDemoTrackingProjection`
- `getTrackingSimulationElapsedSeconds`
- `calculateDemoTrafficFactor`
- `estimateDemoStopMinutes`
- `coordinateAtProgress`
- `calculateRouteStats`
- `refreshPredictiveModel` logic inside store, despues de extraerla.

## Que falta

- Event store.
- Deterministic seed.
- Replay.
- Snapshot state.
- Tenant isolation.
- Tests unitarios para cada evento.
- Backend API para comandos.
- Public read model para customer tracking.

## Que NO debe tocarse aun

- No mover todo el store en una sola refactorizacion.
- No cambiar formulas de ETA antes de cubrirlas con tests.
- No eliminar fallback local.
- No meter provider maps dentro del engine; maps debe ser adapter separado.

## Orden de implementacion

1. Cubrir funciones actuales con tests.
2. Extraer tipos de evento.
3. Crear funciones puras del engine.
4. Conectar store actual al engine sin backend.
5. Persistir eventos.
6. Derivar read models para admin/driver/customer.
7. Agregar WebSocket/polling si se autoriza.
