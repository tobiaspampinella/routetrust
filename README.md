# RoutePulse AI Web Tester

AI-built, human-orchestrated Operational Intelligence Platform for logistics operations.

This project is a restored beta foundation for a SaaS B2B logistics platform. It is built with AI assistance and human strategic oversight; it is not positioned as fully autonomous software and it does not replace human operators.

## New PC Restore Status

- Restored from `RoutePulseAI_Portable_Cycle0_2026-05-27.zip` on 2026-05-30.
- See `docs/RESTORE_REPORT.md`, `docs/ENVIRONMENT_SETUP.md` and `docs/INSTALLATION_REPORT.md`.
- On this PC, npm commands require the explicit Node wrapper documented in `docs/ENVIRONMENT_SETUP.md` until Node/npm are installed normally.

RoutePulse AI Web Tester es una demo local de **Control Tower Lite para ultima milla en LatAm**. Esta version esta pensada para validar el diferencial del producto antes de construir un TMS enterprise completo.

El punto central: RoutePulse AI no es solo tracking. No muestra solamente donde esta el chofer; calcula que significa cada pausa, demora o zona compleja para las entregas pendientes, el ETA por parada, el riesgo de ruta y el cierre operativo del dia.

Version actual del tester: **v0.11**. Los cambios comerciales y tecnicos quedan documentados en `SOFTWARE_LOG.md` y visibles en el footer de la app.

## Problema que resuelve

Muchas operaciones logisticas pequenas y medianas en LatAm trabajan con choferes propios y tercerizados, direcciones incompletas, referencias manuales, tolerancias por entrega, trafico variable y poca visibilidad real del cierre del dia. Esta demo muestra como una torre de control liviana puede convertir eventos simples en decisiones operativas.

## Que incluye esta actualizacion

- Dashboard admin con posicionamiento **Control Tower Lite**.
- ETA predictivo por ventana para cada parada.
- Paradas antes del cliente.
- Drop-off estimado por zona/localidad.
- Riesgo operativo por ruta y por paquete.
- Pausas del driver que impactan ETA, KPIs y cierre estimado.
- Cierre operativo estimado y cumplimiento proyectado.
- KPIs predictivos, no solo historicos.
- Copiloto Operativo con insights generados por reglas simples.
- Tracking cliente demo en `/track/demo`, sin mostrar ruta completa ni datos de otros clientes.
- Tracking cliente mobile-first tipo iPhone/fleet management, con camion en movimiento, ETA vivo, trafico, drop-off y proximas 4 paradas anonimizadas.
- Mapa real provider-ready: si configuras `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `/track/demo` usa Google Maps JavaScript API, Directions y capa de trafico. Sin clave, usa fallback local profesional sin consumir APIs.
- Tracking Demo Builder en `/admin/cms` para administrar textos, soporte, privacidad, proveedor de mapa, hasta 5 paradas demo, trafico por parada e inicio/pausa/reinicio de la simulacion.
- Demo Sandbox operativo dentro del CMS: activar/desactivar demo, generar/resetear datos, iniciar/pausar camion, modificar velocidad, simular trafico, calle bloqueada, retraso, entrega completada y entrega fallida.
- Human Approval Layer visible en CMS con politicas, solicitudes pendientes y resolucion humana de aprobaciones.
- Tracking publico sin controles de edicion; las mutaciones de demo quedan concentradas en admin.
- Inbox QA/CX local en admin para reportar bugs y priorizar fricciones sin exponer credenciales ni tokens externos.
- CMS Enterprise beta en `/admin/cms` para tenants, modulos SaaS, RBAC, approvals, audit logs y configuracion Telegram/branding como base de consola B2B.
- CMS beta 7 dias con navegacion por Resumen, Tenants, Usuarios, Rutas, Drivers, Incidencias, Audit logs, Telegram y Demo sandbox.
- Endpoints protegidos para Telegram status/test en `/api/cms/telegram/status` y `/api/cms/telegram/test`.
- Documentacion de arquitectura CMS en `docs/CMS_AUDIT.md`, `docs/CMS_SPEC.md`, `docs/CMS_IMPLEMENTATION_PLAN.md` y `docs/ACTIVE_TASKS.md`.
- Sistema visual inspirado en Apple.com: tipografia de sistema, fondo claro, cards limpias, botones redondeados, glass nav y jerarquia editorial premium.
- Settings mock para SLA objetivo, tolerancias, drop-off base, modo predictivo, riesgo y tracking cliente.
- Login protegido con cookie HTTP-only y middleware por rol para `/admin` y `/driver`.
- Base pequena de usuarios tester en `src/data/testUsersDb.ts`, con hashes de password y sin credenciales visibles en pantalla.
- Footer global con version del software y bitacora en `SOFTWARE_LOG.md`.

## KPIs principales

- Paquetes del dia
- Entregados, pendientes y fallidos
- Cumplimiento actual
- SLA objetivo vs SLA proyectado
- Cierre operativo estimado
- Rutas en riesgo
- Paquetes en riesgo de atraso
- Confianza promedio del ETA
- Drop-off promedio y drop-off por zona
- Pausas acumuladas por driver
- Productividad por driver
- Reasignaciones sugeridas

## Como correr

Desde la raiz del workspace:

```bash
npm install
npm run dev
```

O desde el proyecto:

```bash
cd routepulse-ai-tester
npm install
npm run dev
```

Luego abre:

```txt
http://localhost:3000/login
```

### Mapa real opcional

Para activar calles reales, rutas y trafico en el tracking demo:

```bash
cp .env.example .env.local
```

Completa:

```txt
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

Luego reinicia `npm run dev`. Sin esa clave, el demo sigue funcionando con fallback visual local, pero no promete trafico real.

Variables reservadas para siguientes integraciones:

```txt
NEXT_PUBLIC_MAP_PROVIDER=local
OPENROUTESERVICE_API_KEY=
```

## Usuarios demo

Las credenciales no se muestran en la pantalla de login. Para QA interno:

Admin:

```txt
email: admin@demo.com
password: admin123
```

Drivers:

```txt
email: driver1@demo.com
password: driver123
assignedRouteId: route-001
```

```txt
email: driver2@demo.com
password: driver123
assignedRouteId: route-002
```

## Rutas disponibles

- `/login`
- `/admin` requiere sesion admin
- `/admin/routes` requiere sesion admin
- `/admin/kpis` requiere sesion admin
- `/admin/cms` requiere sesion admin
- `/admin/settings` requiere sesion admin
- `/driver` requiere sesion driver
- `/driver/route` requiere sesion driver
- `/track/demo`

## Datos demo

`src/data/mockData.ts` contiene 1 empresa, 1 almacen, 3 drivers, 3 unidades, 3 rutas, 60 paquetes y zonas LatAm con trafico, dificultad de parking, tasa de fallo y drop-off promedio.

Cada paquete incluye tracking, cliente, direccion, referencia, localidad, secuencia, estado, ETA por ventana, paradas antes, confianza ETA, riesgo, prioridad y drop-off estimado.

## Logica de calculo

Las reglas testeables estan en:

- `src/lib/etaCalculations.ts`
- `src/lib/kpiCalculations.ts`
- `src/lib/operationalInsights.ts`

Documentacion complementaria:

- `docs/DEMO_SANDBOX_SPEC.md`
- `docs/CURRENT_DECISIONS.md`

No usan APIs externas ni IA real. Son funciones puras para validar el flujo de producto.

## Limitaciones actuales

- No hay backend real.
- No hay WebSockets.
- El mapa real requiere `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; sin clave se usa fallback local.
- Apple MapKit y OpenRouteService no estan integrados todavia.
- No hay app movil nativa.
- No hay optimizacion avanzada de rutas.
- No hay OpenAI API ni copiloto con LLM.
- La persistencia es local por navegador mediante `localStorage`.
- Las credenciales tester siguen siendo semilla local, no un sistema de identidad productivo.

## Checks manuales sugeridos

- Login admin y revisar `/admin`: debe comunicar Control Tower Lite y mostrar Copiloto Operativo.
- Ir a `/admin/routes`: cada parada debe mostrar ventana ETA, paradas antes, referencia, drop-off, confianza y riesgo.
- Login driver y pausar ruta: el ETA de paradas pendientes, pausa acumulada, riesgo y cierre estimado deben cambiar.
- Marcar una entrega como entregada o fallida: paradas restantes, cumplimiento, SLA proyectado y cierre deben recalcularse.
- Abrir `/track/demo`: debe mostrar solo el paquete demo, su ventana ETA, paradas antes, confianza y ultimo evento.
- Abrir `/admin/cms`: editar contenido, agregar paradas demo, iniciar/pausar/reiniciar la simulacion y verificar que impacta en `/track/demo`.

## Proximos pasos

- Backend con base de datos y roles reales.
- Historial de eventos por paquete/ruta.
- WebSockets para actualizacion multiusuario.
- Motor real de eventos operativos.
- Mapas y geocoding cuando el flujo mock este validado.
- Optimizacion de rutas y prediccion avanzada de riesgo.
