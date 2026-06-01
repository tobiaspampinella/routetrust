# RoutePulse AI Software Log

## v0.14

- Corte FASE 5 beta core implementado sin backend real ni microservicios.
- Admin dashboard agrega CEO beta overview con core readiness, approvals, incidents, audit, Telegram y maps fallback.
- Route Simulation Engine agregado como contrato puro testeable para snapshot demo y eventos auditables.
- Driver portal agrega reporte basico de incidencias desde `/driver/route`.
- Estado local agrega `incidents` con acciones `reportIncident` y `resolveIncident`.
- Customer tracking mantiene fallback local y Google solo se activa cuando el provider mode es `google_maps_ready`.
- Telegram agrega endpoint de project intelligence en `/api/cms/telegram/project-intelligence`.
- Bug assistant agrega intake basico por `/api/bugs` y routing local por modulo.
- Tests puros agregados con Node test runner via `tsx --test`.
- Auth local en `next start` conserva sesion HTTP en localhost sin marcar la cookie como secure; produccion fuera de localhost sigue usando secure cookies.

## v0.11

- Auditoria actualizada del CMS, Demo Sandbox, mapas/tracking, env, rutas, permisos y brechas P0/P1.
- Nuevos documentos: `docs/DEMO_SANDBOX_SPEC.md` y `docs/CURRENT_DECISIONS.md`.
- CMS Enterprise agrega seccion **Aprobaciones** con politicas Human Approval Layer, solicitudes pendientes y acciones aprobar/rechazar por humano.
- Demo Sandbox del CMS ahora permite activar/desactivar demo, generar/resetear datos, iniciar/pausar camion, cambiar velocidad, simular trafico, calle bloqueada, retraso, entrega completada y entrega fallida.
- Las acciones del sandbox actualizan estado mock/local, agregan eventos al timeline y registran audit logs.
- Calle bloqueada crea una incidencia demo y una solicitud de aprobacion por reasignacion critica.
- Modelo CMS ampliado con `CmsApprovalRequest`, eventos sandbox y estado detallado de simulacion.
- `.env.example` agrega `NEXT_PUBLIC_MAP_PROVIDER` y reserva `OPENROUTESERVICE_API_KEY` para futura integracion MapLibre/OpenRouteService.

## v0.10

- `/track/demo` redisenado como vista tipo fleet management: mapa grande, vehiculo en vivo, ETA cliente, trafico, drop-off, estado de ruta y siguientes 4 paradas protegidas.
- Integracion provider-ready con Google Maps JavaScript API: al configurar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` se cargan calles reales, `DirectionsService` y `TrafficLayer`.
- Fallback local mejorado para demos sin API key: mantiene recorrido animado, calles visuales, camion 3D, etiquetas de barrio y aviso claro de proveedor pendiente.
- Datos demo ampliados a 5 paradas reales de Buenos Aires con lat/lng, prioridad, trafico y drop-off.
- `/admin/cms` ahora previsualiza el mismo mapa comercial y permite iniciar/pausar/reiniciar la demo con las paradas configuradas.
- `.env.example` y README documentan como activar mapa real legalmente sin exponer claves.

## v0.09

- CMS beta 7 dias: navegacion interna por Resumen, Tenants, Usuarios, Rutas, Drivers, Incidencias, Audit logs, Telegram y Demo sandbox.
- Tenants: crear tenant demo, activar/desactivar/suspender y asignar modulos habilitados.
- Usuarios: crear usuario, asignar rol, asignar tenant y suspender/reactivar.
- Rutas sugeridas: modificar cierre/paradas, asignar driver, aprobar y rechazar con audit log.
- Drivers: listar y crear drivers por tenant.
- Incidencias: listar, cambiar estado y asignar responsable.
- Telegram: endpoints protegidos para validar env y enviar test notification si `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` existen.
- Demo sandbox: generar datos demo, reiniciar demo y ver dashboard separado.
- Backend guard inicial para `/api/cms/*` con permiso CMS y bloqueo cross-tenant basico.

## v0.08

- Auditoria formal del CMS en `docs/CMS_AUDIT.md`.
- Especificacion enterprise del CMS en `docs/CMS_SPEC.md`.
- Plan de implementacion en `docs/CMS_IMPLEMENTATION_PLAN.md` y tareas activas en `docs/ACTIVE_TASKS.md`.
- Agregado modelo CMS beta con roles, permisos, modulos SaaS, tenants, approvals, audit logs, Telegram config y branding basico.
- Agregados servicios puros para CMS, RBAC, auditoria y tenant.
- `/admin/cms` ahora abre con tab Enterprise para administrar tenants, modulos, RBAC, approvals y audit log en modo beta local.
- Agregado shortcut `/cms` hacia `/admin/cms`.

## v0.07

- Tracking público endurecido para venta: ya no expone controles de edición, alta de pedidos, pausa ni reset; solo muestra ETA, paradas anonimizadas y estado del cliente.
- Footer de versión oculto en tracking público y mobile para no tapar acciones ni ETA.
- Login sin accesos rápidos visibles y redirección `next` respetada también desde middleware.
- Driver muestra próximas paradas reales pendientes y acciones con copy más claro.
- Se retiró el intento de mapa con tiles externos para mantener el tester sin APIs externas hasta aprobar proveedor, billing y términos.
- Widget QA/CX ajustado como inbox local seguro, sin prometer uso de tokens externos ni cambios automáticos de código.

## v0.06

- `/admin/cms` pasa de editor de copy a **Tracking Demo Builder**: alta de hasta 5 paradas demo, trafico por parada, prioridad, drop-off, controles de iniciar/pausar/reiniciar simulacion y preview del mapa 3D.
- `/track/demo` queda conectado al mismo estado local: las paradas agregadas, el trafico mock, la pausa y el avance de ruta impactan ETA, estado, confianza, eventos y recorrido del camion.
- Se mantiene estrategia sin APIs externas: mapa 3D simulado local y proveedor `ready` para Apple MapKit o Google Maps cuando existan claves, billing y terminos aprobados.
- Footer actualizado a `v0.06` para documentar el avance de producto.

## v0.05

- Sistema visual actualizado a una estetica inspirada en Apple.com: tipografia de sistema, fondos `#f5f5f7`, superficies blancas, botones pill, glassmorphism sobrio y headers de gran jerarquia.
- Componentes base refinados: `Button`, `Input`, `Card`, `PageHeader`, `StatCard`, `AdminShell`, `DriverShell`, `Login` y footer de version.
- Se mantiene marca propia RoutePulse AI sin clonar assets, textos ni identidad Apple.

## v0.04

- Tracking cliente redisenado como experiencia mobile tipo iPhone con mapa 3D simulado, camion en vivo, ETA dinamico y proximas 4 paradas.
- Agregado modelo `trackingCms` para administrar copy, soporte, privacidad, proveedor de mapa y velocidad de simulacion desde estado local.
- Nueva ruta protegida `/admin/cms` para comenzar el CMS operativo del producto.
- Preparada estrategia de proveedores: mock 3D local, Google Maps ready y Apple MapKit ready sin consumir APIs externas ni claves en esta etapa.

## v0.03

- Corregido render del admin en React/Zustand usando selectors estables.
- Revalidado flujo completo en navegador: login admin, dashboard, KPIs, rutas, settings, login driver, ruta driver, pausa, reanudar, entrega, fallo y tracking cliente.
- Labels del login asociados correctamente a los inputs para mejorar accesibilidad y QA.
- Servidor local reiniciado en `http://localhost:3000` con build y lint limpios.

## v0.02

- Login protegido con endpoint server-side y cookie HTTP-only.
- Middleware para proteger `/admin` y `/driver` por rol.
- Credenciales removidas de la pantalla de login.
- Base de usuarios demo separada en `src/data/testUsersDb.ts` con hashes SHA-256 para tester local.
- Footer global con version visible.
- Re-check de QA sobre lint, build y rutas principales.

## v0.01

- Web tester inicial con dashboard admin, rutas, KPIs, settings, driver web y tracking cliente demo.
