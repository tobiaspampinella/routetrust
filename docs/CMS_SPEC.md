# CMS Spec - RoutePulse AI SaaS Console

## Vision

El CMS de RoutePulse AI debe ser la consola interna enterprise para administrar el SaaS logistico: tenants, usuarios, roles, modulos, configuracion operacional, aprobaciones humanas, auditoria, notificaciones, demo sandbox, branding basico y reportes.

No es solo un gestor de contenido. Es el centro administrativo, operativo y comercial de la plataforma.

## Principios

- Multi-tenant desde el modelo, aunque la beta siga usando datos mock.
- RBAC granular por rol y permiso.
- Toda accion critica debe pasar por Human Approval Layer.
- Todo cambio debe generar audit log.
- No exponer secretos en frontend.
- No integrar APIs externas sin provider legal, billing y terminos aprobados.
- UI separada de servicios, permisos, auditoria y modelos.

## Modulos CMS

### 1. Empresas / Tenants

Campos principales:

- id
- nombre
- estado: active, inactive, suspended
- plan: starter, growth, pro, enterprise
- modulos habilitados
- usuarios asociados
- metricas generales
- estado operativo
- branding basico

Acciones:

- crear empresa
- editar empresa
- activar/desactivar
- suspender
- configurar plan
- activar/desactivar modulos
- ver usuarios
- ver metricas
- ver estado operativo

### 2. Usuarios

Campos principales:

- id
- tenantId
- nombre
- email
- rol
- departamento
- estado
- ultima actividad

Acciones:

- crear usuario
- editar usuario
- suspender usuario
- resetear password
- asignar rol
- asignar empresa
- asignar departamento
- ver actividad

### 3. Roles y permisos

Roles minimos:

- Super Admin
- Admin Empresa
- Operaciones
- Dispatcher
- Driver
- Customer Experience
- Customer Success
- CFO / Finanzas
- Comercial
- Cliente Externo
- Viewer

Permisos minimos:

- view
- create
- update
- delete
- approve
- assign
- export
- configure

La matriz RBAC debe ser editable desde CMS, pero cambios de permisos requieren aprobacion humana.

### 4. Modulos SaaS por tenant

Modulos:

- dashboard operacional
- tracking
- portal driver
- rutas
- incidencias
- customer tracking
- reportes
- Telegram notifications
- audit logs
- demo sandbox

### 5. Configuracion operacional

Debe administrar:

- zonas
- rutas base
- drivers
- vehiculos
- SLA
- reglas de asignacion
- horarios operativos
- prioridades
- tipos de incidencia
- estados de entrega

### 6. Human Approval Layer

Acciones que requieren aprobacion:

- aprobacion final de rutas sugeridas
- reasignacion critica
- cancelacion de ruta
- cambios de SLA
- cambios de permisos
- cambios de tenant
- cambios de configuracion operacional critica

Modelo:

- action
- required
- approverRoles
- automationLimit
- status: pending, approved, rejected
- reason
- requestedBy
- approvedBy
- timestamps

### 7. Auditoria

Todo cambio del CMS debe generar:

- actor
- rol
- tenant
- accion
- modulo
- valor anterior
- valor nuevo
- timestamp
- IP/user agent si existe
- resultado

El audit log productivo debe ser append-only.

### 8. Notificaciones

Configurable por CMS:

- Telegram bot token
- Telegram chat ID
- eventos notificados
- responsables
- alertas criticas
- notificaciones de build
- notificaciones operativas

Secretos:

- Nunca renderizar token en frontend.
- Guardar token en backend/secret manager.
- Mostrar solo estado: configured / missing.

### 9. Demo Sandbox

Debe permitir:

- activar modo demo
- cargar datos ficticios
- reiniciar demo
- configurar rutas demo
- configurar drivers demo
- configurar clientes demo
- ver estado demo

### 10. Branding / White-label basico

Beta:

- logo
- nombre empresa
- color primario
- color secundario
- dominio futuro
- textos basicos
- idioma futuro

No priorizar white-label avanzado hasta despues de validar beta.

### 11. Reportes CMS

Debe mostrar:

- rutas activas
- rutas completadas
- rutas fallidas
- incidencias
- drivers activos
- SLA en riesgo
- entregas demoradas
- actividad por usuario
- eventos recientes

### 12. Seguridad

Requisitos:

- proteccion por rol
- validacion backend
- bloqueo de acciones criticas
- audit logs
- tenant isolation
- no exponer datos sensibles en frontend
- no acciones cross-tenant sin Super Admin

## APIs necesarias

Tenants:

- `GET /api/cms/tenants`
- `POST /api/cms/tenants`
- `PATCH /api/cms/tenants/:tenantId`

Usuarios:

- `GET /api/cms/users`
- `POST /api/cms/users`
- `PATCH /api/cms/users/:userId`

RBAC:

- `GET /api/cms/rbac`
- `PATCH /api/cms/rbac`

Auditoria:

- `GET /api/cms/audit-logs`

Approvals:

- `GET /api/cms/approvals`
- `POST /api/cms/approvals`
- `PATCH /api/cms/approvals/:approvalId`

Notificaciones:

- `GET /api/cms/notifications/telegram`
- `PATCH /api/cms/notifications/telegram`

Demo:

- `POST /api/cms/demo/reset`
- `PATCH /api/cms/demo/config`

## Modelo de datos sugerido

Entidades:

- Tenant
- TenantModule
- CmsUser
- Role
- Permission
- RolePermission
- ApprovalPolicy
- ApprovalRequest
- AuditLog
- OperationalConfig
- NotificationConfig
- DemoSandboxConfig
- BrandingConfig

## Primera beta implementada

Incluye:

- Tab Enterprise en `/admin/cms`.
- Tenants mock con activar/desactivar/suspender.
- Activacion/desactivacion local de modulos.
- Matriz RBAC visible.
- Human Approval policies visibles.
- Audit log local generado por acciones de tenant/modulo.
- Telegram config como estado seguro sin exponer secretos.
- Lista de APIs necesarias.

No incluye aun:

- Backend real.
- Base de datos.
- Persistencia cross-browser.
- Approval workflow real.
- Secret manager.
