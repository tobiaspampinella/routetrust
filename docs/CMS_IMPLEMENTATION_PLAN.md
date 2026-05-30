# CMS Implementation Plan

## Fase 0 - Auditoria y base beta

Estado: en progreso.

Entregables:

- `docs/CMS_AUDIT.md`
- `docs/CMS_SPEC.md`
- `docs/CMS_IMPLEMENTATION_PLAN.md`
- `docs/ACTIVE_TASKS.md`
- `src/modules/cms/types.ts`
- `src/services/cms/cmsService.ts`
- `src/services/permissions/rbac.ts`
- `src/services/audit/auditLog.ts`
- `src/services/tenant/tenantService.ts`
- Tab Enterprise en `/admin/cms`.

## Fase 1 - Consolidar CMS frontend beta

Prioridad P0:

- Separar `AdminCms.tsx` en subcomponentes por dominio:
  - `CmsEnterpriseOverview`
  - `CmsTenantPanel`
  - `CmsUsersPanel`
  - `CmsRbacPanel`
  - `CmsApprovalPanel`
  - `CmsAuditPanel`
  - `CmsNotificationsPanel`
  - `CmsDemoSandboxPanel`
- Convertir acciones de Live Ops en propuestas auditables.
- Mostrar confirmacion antes de acciones criticas.
- Mostrar razon y estado de aprobacion pendiente.
- Mantener tracking demo separado de operaciones reales.

## Fase 2 - RBAC y seguridad

Prioridad P0:

- Expandir `UserRole` actual a roles CMS o crear capa separada `CmsRole`.
- Validar permisos server-side.
- Middleware por rol y modulo.
- Bloquear cross-tenant access.
- No renderizar datos de tenants no autorizados.

## Fase 3 - Backend y persistencia

Prioridad P0/P1:

- Elegir DB para beta: SQLite/Prisma o Postgres.
- Crear tablas para tenants, users, roles, permissions, approvals, audit logs, notification configs.
- Migrar Zustand de fuente de verdad a cliente/cache.
- Crear API routes CMS.
- Agregar validacion con schemas.

## Fase 4 - Human Approval Layer

Prioridad P0:

- Crear approval requests.
- Requerir approval para:
  - rutas sugeridas finales
  - reasignacion critica
  - cancelacion de ruta
  - cambios SLA
  - cambios permisos
  - cambios tenant
  - configuracion operacional critica
- Registrar aprobaciones y rechazos con razon.

## Fase 5 - Auditoria productiva

Prioridad P0:

- Audit log append-only.
- Captura IP/user agent en API.
- Export CSV/JSON para roles permitidos.
- Filtros por tenant, actor, modulo, resultado y fecha.

## Fase 6 - Notificaciones

Prioridad P1:

- Configuracion Telegram server-side.
- Token en secret manager/env.
- Validar chat ID.
- Eventos:
  - rutas en riesgo alto
  - SLA en riesgo
  - approval pendiente
  - build failed
  - incidente critico

## Fase 7 - Reportes CMS

Prioridad P1:

- Reportes por tenant.
- Actividad por usuario.
- Rutas completadas/fallidas.
- SLA en riesgo.
- Incidencias.
- Eventos recientes.

## Tareas delegables a otros agentes

QA Analyst:

- Validar rutas protegidas.
- Probar acciones Enterprise CMS.
- Verificar que audit log registre cambios.
- Confirmar que no hay controles de edicion en `/track/demo`.

Full Stack Developer:

- Separar paneles CMS.
- Crear API routes.
- Agregar persistencia.
- Conectar RBAC server-side.

UX Designer:

- Reducir densidad visual del CMS.
- Disenar tabla RBAC editable.
- Disenar approval queue.
- Pulir copy B2B logistico.

Customer Experience:

- Revisar lenguaje para operadores no tecnicos.
- Detectar fricciones en admin y Live Ops.
- Probar reportes de bugs desde inbox QA/CX.

AI Orchestrator:

- Definir limites de automatizacion.
- Mapear acciones IA vs acciones humanas.
- Mantener approvals como guardrail obligatorio.

## Riesgos

- Confundir demo local con plataforma productiva.
- Acciones criticas sin aprobacion.
- Tokens o secretos en frontend.
- Roles frontend sin validacion backend.
- Estado local no compartido entre navegadores.
- Crecimiento de `AdminCms.tsx` como componente monolitico.

## Definition of Done beta CMS

- Tenants visibles y editables localmente.
- Modulos por tenant editables localmente.
- RBAC visible y preparado para edicion.
- Approval policies visibles.
- Audit log registra acciones.
- Docs actualizadas.
- `npm run lint` limpio.
- `npm run build` limpio.
