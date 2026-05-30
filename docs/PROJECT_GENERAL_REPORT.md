# RoutePulse AI - General Project Report

Fecha: 2026-05-27

## Resumen Ejecutivo

RoutePulse AI empezo como un web tester local para demostrar una idea de ultima milla. Evoluciono hacia una vision mas ambiciosa: una **AI-built, human-orchestrated Operational Intelligence Platform for logistics operations**.

El producto tiene una tesis fuerte: no competir como "otro tracking", sino convertirse en una torre de control operativa liviana para empresas logisticas pequenas y medianas, primero en LatAm.

El diferencial correcto es:

- ETA predictivo por parada.
- Riesgo operativo por ruta.
- Impacto de pausas, trafico, drop-off e incidencias sobre las entregas pendientes.
- Human-in-the-loop para decisiones criticas.
- Demo sandbox comercial para mostrar valor sin datos reales.

## Estado Actual Del Proyecto

Funciona hoy:

- Landing page.
- Login demo admin/driver.
- Dashboard admin mock.
- KPIs mock.
- Rutas mock.
- Settings mock.
- Driver portal mock.
- Customer tracking demo.
- CMS beta local.
- Demo sandbox local.
- Human Approval Layer visual.
- Map tracking fallback local y preparacion para Google Maps.

Parcialmente listo:

- Prisma schema minimo para Cycle 0.
- Docker Compose para Postgres/Redis.
- Seed Prisma.
- Documentacion de gobernanza.
- Plan de agentes.

No listo aun:

- Backend NestJS real.
- APIs `/api/v1`.
- Auth JWT real.
- RBAC real.
- Multi-tenant isolation real en DB.
- Redis runtime para posiciones.
- Socket.io real.
- MapLibre real.
- Playwright tests.
- CI/CD.
- Deployment.

## Lo Que Se Debe Cambiar

1. Separar claramente demo local vs plataforma real.
2. Construir backend real antes de seguir agregando UI.
3. Unificar auth: dejar de depender de usuarios demo hardcodeados.
4. Hacer que CMS admin opere sobre datos reales.
5. Cambiar Zustand/localStorage por API + TanStack Query para data de negocio.
6. Mantener Zustand solo para estado UI/realtime liviano.
7. Implementar multi-tenancy desde el primer endpoint backend.
8. No seguir agregando pantallas sin contratos de datos.
9. Convertir demo sandbox en producto comercial controlado.
10. Implementar MapLibre fallback real antes de Google Maps premium.

## Lo Que Hay Que Mejorar

Producto:

- Foco brutal en dispatcher, driver y cliente final.
- Menos features aspiracionales, mas workflows operativos completos.
- Approval workflow real.
- Incident management real.
- ETA/SLA explicable.

UX:

- Admin debe ser mas denso, rapido y menos decorativo.
- Driver debe ser PWA mobile-first.
- Customer tracking debe comunicar confianza, no complejidad.

Tecnico:

- NestJS API.
- Prisma migrations.
- PostgreSQL real.
- Redis para posiciones.
- Socket.io con rooms por tenant.
- Tests e2e.
- CI que bloquee merges rotos.

Seguridad:

- JWT + refresh.
- Cookies httpOnly.
- Rate limit en login.
- Validacion backend por rol.
- Prevencion de acceso cross-tenant.
- Audit log inmutable.

## Informacion Que Falta Del Humano

Para convertir esto en SaaS operable de mercado necesitamos decisiones del CEO:

1. Nombre definitivo comercial: RoutePulse AI, OpLogix, u otro.
2. Mercado inicial: Argentina, Mexico, Chile, Colombia o LatAm general.
3. Cliente ideal inicial: couriers, e-commerce logistics, cold chain, paqueteria, distribucion B2B.
4. Tamano del cliente objetivo: cantidad de drivers/rutas/entregas diarias.
5. Modelo de pricing: por driver, por entrega, por tenant, por modulo.
6. Primer proveedor de mapas real: MapLibre/OSM, Google Maps, HERE, Mapbox, Apple MapKit.
7. Nivel de precision requerido: tracking exacto vs aproximado para cliente final.
8. Politica de privacidad y retencion de GPS.
9. Pais legal/fiscal para vender.
10. Identidad visual definitiva.
11. Dominio.
12. Hosting elegido: Vercel + Railway/Supabase/Render/AWS/GCP.
13. Canal de ventas: founder-led, agencias logisticas, partners, cold outreach.
14. KPI north star: entregas a tiempo, ahorro operativo, reduccion de reclamos, utilizacion de flota.
15. Integraciones prioritarias: WhatsApp, Shopify, WooCommerce, MercadoLibre, ERP, TMS existentes.

## Camino Hacia SaaS Con Potencial Unicornio

La oportunidad no esta en "hacer un dashboard bonito". Esta en volverse el sistema nervioso de ultima milla para empresas medianas que hoy operan con planillas, WhatsApp y llamadas.

Fase 1:

- Beta estable con rutas, driver portal, tracking cliente, incidencias y audit logs.

Fase 2:

- Integraciones con e-commerce/logistica.
- WhatsApp/Telegram operativo.
- Reportes SLA y costo operativo.

Fase 3:

- Marketplace de drivers/proveedores.
- Benchmark anonimo por zona.
- Optimizacion predictiva con datos propios.

Fase 4:

- Expansion multi-pais.
- Pricing modular.
- Data moat operativo: tiempos reales de drop-off, fallos, zonas, trafico, confiabilidad por operador.

## Recomendacion Principal

No seguir expandiendo features visuales hasta completar el backend core. La build estable depende de cerrar:

- Auth real.
- Tenant isolation.
- Routes API.
- Drivers API.
- Incidents API.
- AuditLog.
- WebSocket.
- Demo sandbox real.

