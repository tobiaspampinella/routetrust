# FASE 4 - CMS/Admin Audit

Fecha: 2026-05-31
Alcance: auditoria solamente. No se implementaron features.
Proyecto auditado: `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`

## Evidencia revisada

- `package.json`
- `prisma/schema.prisma`
- `src/app/**`
- `src/components/admin/**`
- `src/components/driver/**`
- `src/components/customer/**`
- `src/components/shared/CxAssistantWidget.tsx`
- `src/lib/**`
- `src/modules/cms/types.ts`
- `src/services/**`
- `src/store/routePulseStore.ts`
- `.env.example`

## Rutas actuales

| Ruta | Archivo | Estado |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Landing publica. |
| `/login` | `src/app/login/page.tsx` | Login demo. |
| `/cms` | `src/app/cms/page.tsx` | Redirect a `/admin/cms`. |
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin. |
| `/admin/cms` | `src/app/admin/cms/page.tsx` | CMS shell + enterprise console + demo builder + live ops. |
| `/admin/kpis` | `src/app/admin/kpis/page.tsx` | KPIs operativos mock. |
| `/admin/routes` | `src/app/admin/routes/page.tsx` | Tabla y detalle de rutas mock. |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Settings operativos mock. |
| `/driver` | `src/app/driver/page.tsx` | Home driver. |
| `/driver/route` | `src/app/driver/route/page.tsx` | Workflow driver. |
| `/track/demo` | `src/app/track/demo/page.tsx` | Tracking cliente demo. |
| `/api/auth/login` | `src/app/api/auth/login/route.ts` | Login demo. |
| `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | Logout demo. |
| `/api/auth/me` | `src/app/api/auth/me/route.ts` | Session demo. |
| `/api/cms/telegram/status` | `src/app/api/cms/telegram/status/route.ts` | Estado env Telegram protegido. |
| `/api/cms/telegram/test` | `src/app/api/cms/telegram/test/route.ts` | Test Telegram protegido. |

## CMS/Admin actual

Existe:

- `AdminShell` con navegacion admin, verificacion de session via `/api/auth/me`, logout y widget `CxAssistantWidget`.
- `AdminCms` con tabs `Enterprise`, `Demo Builder` y `Live Ops`.
- `CmsEnterpriseOverview` con secciones: resumen, tenants, usuarios, rutas, drivers, incidencias, aprobaciones, audit logs, Telegram y demo sandbox.
- `LiveCmsTab` con acciones mock para iniciar ruta, recalcular ETA, reasignar, entregar y fallar paradas.
- Tipos CMS en `src/modules/cms/types.ts`.
- Seeds CMS en `src/services/cms/cmsService.ts`.
- Helpers locales para tenants, audit log y RBAC.

Falta:

- Persistencia real para CMS.
- API CRUD real para tenants, users, roles, permisos, approvals, audit logs, demo sandbox e incidencias.
- Validacion backend por schema.
- Tenant isolation real en DB.
- Audit log append-only en backend.
- Approval workflow obligatorio antes de mutaciones criticas.
- Secret manager o configuracion segura para notificaciones.

Roto o riesgoso:

- El CMS dice "enterprise", pero la fuente de verdad es React state/Zustand/localStorage.
- `CmsEnterpriseOverview.tsx` es demasiado grande y mezcla UI, estado, acciones, audit local, Telegram UI y sandbox.
- Hay mojibake en strings visibles del codigo (`Ãšltima`, `trÃ¡fico`, `camiÃ³n`, `direcciÃ³n`, etc.). Build puede pasar, pero la UI queda mal codificada.
- `defaultBuildStatus` en `cmsService.ts` es seed estatico, no lee CI ni git.
- Prisma schema existe, pero las pantallas actuales no usan Prisma Client.

Reutilizable:

- `src/modules/cms/types.ts`
- `src/services/permissions/rbac.ts`
- `src/services/audit/auditLog.ts`
- `src/services/tenant/tenantService.ts`
- `src/services/cms/cmsService.ts` como seed/reference, no como backend final.
- `AdminShell`, `AdminDashboard`, `AdminRoutes`, `AdminKpis`, `AdminSettings`.
- `CmsEnterpriseOverview` como prototipo funcional, aunque debe particionarse antes de crecer.

No debe tocarse sin autorizacion:

- No reemplazar la shell admin completa.
- No eliminar fallback local de mapas.
- No convertir acciones mock en acciones productivas sin approvals y audit backend.
- No exponer tokens Telegram o API keys en cliente.
- No mezclar package managers.
- No crear CMS backend hasta FASE autorizada.

## Dashboard CEO/Admin

Existe:

- `AdminDashboard` muestra KPIs diarios, avance, riesgo, cierre estimado, cumplimiento, paquetes en riesgo, drivers activos e insights.
- `AdminKpis` muestra productividad por driver, SLA, fallos, drop-off y riesgo por zona.

Falta:

- Dashboard CEO formal de negocio.
- Estado de builds real.
- Estado de agentes multiagente real.
- Metricas por tenant reales.
- Filtros por fecha, tenant, region y cliente.

Roto o riesgoso:

- Las metricas se calculan desde mocks; no representan operacion real.
- No hay trazabilidad entre KPI y evento/audit log persistido.

## Auth/RBAC actual

Existe:

- Middleware protege `/admin/*` para `admin` y `/driver/*` para `driver`.
- Session cookie `routepulse_session` firmada con `ROUTEPULSE_DEMO_SECRET` o fallback local.
- `serverAuth.ts` autentica contra `testUsersDb`.
- RBAC CMS granular existe como helper local con roles y permisos.
- `requireCmsPermission` protege endpoints Telegram con permiso `configure`.

Falta:

- Usuarios reales en DB.
- Password hashing productivo con salt individual.
- Refresh tokens.
- CSRF hardening documentado.
- Middleware por tenant/modulo.
- RBAC persistido y versionado.

Roto o riesgoso:

- `ROUTEPULSE_DEMO_SECRET` tiene fallback default. Aceptable demo, inaceptable produccion.
- Roles runtime reales son solo `admin` y `driver`; roles CMS amplios son simulados.
- `requireCmsPermission` hardcodea tenants permitidos.

## Componentes actuales

Admin:

- `AdminShell`
- `AdminDashboard`
- `AdminCms`
- `CmsEnterpriseOverview`
- `LiveCmsTab`
- `AdminRoutes`
- `AdminKpis`
- `AdminSettings`

Driver:

- `DriverShell`
- `DriverHome`
- `DriverRoute`

Customer/maps:

- `CustomerTrackingDemo`
- `FleetTrackingMap`
- `CustomerTrackingMap3D`
- `DriverMap`

Shared/UI:

- `CxAssistantWidget`
- `PageHeader`
- `RouteMapPlaceholder`
- `StatCard`
- `StatusBadge`
- `VersionFooter`
- UI primitives: badge, button, card, input, label, modal, progress.

## Que falta para CMS beta estable

1. Backend API real para CMS core.
2. Persistencia DB y migraciones validadas.
3. Service layer con permisos, tenant guard y audit obligatorio.
4. Particion de `CmsEnterpriseOverview.tsx` en panels mantenibles.
5. Tests de rutas protegidas, RBAC y flujos admin/driver/customer.
6. Fix de encoding de textos visibles.
7. Integracion CI real para build status.

## Tareas por agente

| Agente | Tareas |
| --- | --- |
| Codex Node | Mantener governance, locks, arquitectura, handoffs y secuencia de fases. |
| Full Stack Agent | Diseñar API CMS, persistence layer, tenant guard, RBAC backend y audit append-only. |
| QA Agent | Escribir matriz de regression para admin, driver, tracking, auth y Telegram endpoints. |
| UX/UI Agent | Reducir densidad del CMS y separar paneles sin cambiar funcionalidad. |
| Maps Agent | Auditar proveedor local/Google/MapLibre y terminos antes de integrar. |
| Telegram Agent | Diseñar bot/event routing sin exponer secrets. |
| Bug Assistant Agent | Diseñar modelo/API/panel de bug reports antes de tocar widget. |
| Docs Agent | Mantener specs sincronizadas con codigo real, no aspiracional. |

## Orden de implementacion recomendado

1. Fix minimo de encoding de UI strings.
2. Tests smoke para rutas protegidas y flujos mock actuales.
3. Particion controlada de CMS UI en paneles.
4. API CMS backend con tenant guard y audit log.
5. RBAC persistido.
6. Demo sandbox event contract persistido.
7. Telegram event router.
8. Bug assistant durable.

## Estado FASE 4

Auditoria completada. No se implementaron features.
