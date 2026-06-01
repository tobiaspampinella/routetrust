# CMS Spec

Fecha: 2026-05-31
Estado: especificacion basada en auditoria FASE 4.

## Proposito

El CMS debe ser la consola operativa y administrativa del SaaS logistico RoutePulse AI. Debe administrar tenants, usuarios, roles, modulos, rutas, drivers, incidencias, aprobaciones humanas, audit logs, demo sandbox, notificaciones y configuracion operacional.

No debe ser tratado como un gestor de contenido. Es el panel de control B2B.

## Principios no negociables

- Multi-tenant desde backend y DB.
- RBAC validado server-side.
- Audit log obligatorio para cambios de estado.
- Acciones criticas pasan por Human Approval Layer.
- Estado demo separado de estado productivo.
- Secrets nunca renderizados en frontend.
- Fallback local de mapas preservado.
- Integraciones externas detras de provider adapters.

## Roles CMS objetivo

- `super_admin`
- `company_admin`
- `operations`
- `dispatcher`
- `driver`
- `customer_experience`
- `customer_success`
- `finance`
- `commercial`
- `external_customer`
- `viewer`

## Permisos CMS objetivo

- `view`
- `create`
- `update`
- `delete`
- `approve`
- `assign`
- `export`
- `configure`

## Modulos CMS objetivo

- Dashboard operacional
- Tracking
- Driver portal
- Routes
- Incidents
- Customer tracking
- Reports
- Telegram notifications
- Audit logs
- Demo sandbox

## Estado actual reutilizable

| Area | Implementacion actual |
| --- | --- |
| Tipos CMS | `src/modules/cms/types.ts` |
| Seeds CMS | `src/services/cms/cmsService.ts` |
| RBAC helper | `src/services/permissions/rbac.ts` |
| Tenant helper | `src/services/tenant/tenantService.ts` |
| Audit helper | `src/services/audit/auditLog.ts` |
| Admin shell | `src/components/admin/AdminShell.tsx` |
| CMS UI | `src/components/admin/AdminCms.tsx`, `src/components/admin/CmsEnterpriseOverview.tsx` |
| Live ops mock | `src/components/admin/LiveCmsTab.tsx` |
| Telegram status/test | `src/app/api/cms/telegram/*` |

## Entidades backend requeridas

### Tenant

- id
- slug
- name
- status
- plan
- enabledModules
- branding
- createdAt
- updatedAt

### CmsUser

- id
- tenantId
- email
- passwordHash
- name
- role
- department
- status
- lastActivityAt
- createdAt
- updatedAt

### RolePermission

- id
- tenantId nullable para defaults globales
- role
- permission
- enabled
- version
- updatedBy
- updatedAt

### ApprovalPolicy

- id
- tenantId nullable
- action
- required
- approverRoles
- automationLimit
- enabled

### ApprovalRequest

- id
- tenantId
- action
- targetType
- targetId
- title
- detail
- requestedBy
- requestedAt
- status
- decidedBy
- decidedAt
- decisionReason

### AuditLog

- id
- tenantId
- actorId
- actorRole
- action
- module
- resourceType
- resourceId
- previousValue
- newValue
- result
- ip
- userAgent
- timestamp

### OperationalConfig

- id
- tenantId
- zones
- slaRules
- assignmentRules
- operationHours
- deliveryStatuses
- incidentTypes
- updatedAt

### NotificationConfig

- id
- tenantId
- provider
- enabled
- events
- owners
- tokenSecretRef
- chatIdSecretRef
- createdAt
- updatedAt

### DemoSandboxConfig

- id
- tenantId
- enabled
- status
- seedProfile
- speedMultiplier
- mapProviderMode
- activeScenario
- lastGeneratedAt

## API surface requerida

Tenants:

- `GET /api/cms/tenants`
- `POST /api/cms/tenants`
- `PATCH /api/cms/tenants/:tenantId`

Users:

- `GET /api/cms/users`
- `POST /api/cms/users`
- `PATCH /api/cms/users/:userId`

RBAC:

- `GET /api/cms/rbac`
- `PATCH /api/cms/rbac`

Approvals:

- `GET /api/cms/approvals`
- `POST /api/cms/approvals`
- `PATCH /api/cms/approvals/:approvalId`

Audit:

- `GET /api/cms/audit-logs`
- `GET /api/cms/audit-logs/export`

Operations:

- `GET /api/cms/routes`
- `PATCH /api/cms/routes/:routeId`
- `GET /api/cms/drivers`
- `PATCH /api/cms/drivers/:driverId`
- `GET /api/cms/incidents`
- `POST /api/cms/incidents`
- `PATCH /api/cms/incidents/:incidentId`

Demo sandbox:

- `GET /api/cms/demo-sandbox`
- `POST /api/cms/demo-sandbox/generate`
- `POST /api/cms/demo-sandbox/reset`
- `POST /api/cms/demo-sandbox/events`
- `PATCH /api/cms/demo-sandbox/config`

Telegram:

- `GET /api/cms/telegram/status`
- `POST /api/cms/telegram/test`
- `POST /api/cms/telegram/events`
- `POST /api/cms/telegram/webhook`

## Human Approval Layer

Acciones que requieren aprobacion:

- Publicar ruta sugerida.
- Reasignacion critica.
- Cancelar ruta.
- Cambiar SLA.
- Cambiar permisos.
- Cambiar tenant, plan o modulo critico.
- Cambiar configuracion operacional critica.
- Enviar notificacion masiva.

Regla: una accion critica puede crear una solicitud, pero no debe ejecutar la mutacion productiva hasta `approved`.

## Criterios de aceptacion CMS beta

- Admin no ve tenants no autorizados.
- Driver no accede a `/admin`.
- Usuario sin `configure` no accede a configuracion Telegram.
- Cambios de permisos generan approval.
- Cambios de tenant generan audit log.
- Audit log queda persistido y no editable.
- Estado demo no modifica rutas productivas.
- Tokens Telegram no aparecen en payload cliente.
- Build status se lee de fuente real o se marca explicitamente como no configurado.

## Limites actuales

- UI actual es demo local.
- No hay backend CMS real.
- No hay WebSockets.
- No hay tests automatizados de CMS.
- Prisma schema no esta conectado al CMS actual.
- MapLibre figura como readiness/docs, no como dependencia instalada.
