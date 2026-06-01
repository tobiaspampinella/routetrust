# CMS Implementation Plan

Fecha: 2026-05-31
Estado: plan posterior a auditoria. No ejecutado.

## Objetivo

Convertir el CMS demo actual en una beta estable sin romper el sandbox comercial existente.

## Regla de fase

Este documento no autoriza implementacion. La siguiente fase debe ser autorizada por el usuario.

## Orden de implementacion

### 1. Correccion previa de calidad visible

Archivos candidatos:

- `src/components/admin/**`
- `src/components/driver/**`
- `src/components/customer/**`
- `src/components/shared/**`
- `src/data/mockData.ts`
- `src/lib/demoMapCoordinates.ts`

Trabajo:

- Corregir mojibake en strings visibles.
- Ejecutar `npm run lint`, `npm run typecheck`, `npm run build`.
- No cambiar comportamiento.

Riesgo:

- Alto impacto visual, bajo riesgo funcional si se limita a strings.

### 2. Regression smoke tests

Archivos candidatos:

- `package.json`
- `tests/**` o `e2e/**`
- `playwright.config.ts`

Trabajo:

- Agregar test runner si se autoriza.
- Cubrir login admin, login driver, `/admin/cms`, `/driver/route`, `/track/demo`, Telegram status sin secrets.

Riesgo:

- Hoy no existe script `test`; agregarlo cambia governance de QA.

### 3. Particion controlada del CMS UI

Archivos candidatos:

- `src/components/admin/CmsEnterpriseOverview.tsx`
- `src/components/admin/cms/*`

Trabajo:

- Extraer panels sin cambiar logica.
- Mantener nombres de acciones y tipos existentes.
- No introducir backend en esta etapa.

Riesgo:

- `CmsEnterpriseOverview.tsx` es monolitico; refactor sin tests puede romper UI.

### 4. API CMS backend minima

Archivos candidatos:

- `src/app/api/cms/**`
- `src/services/cms/**`
- `src/services/permissions/**`
- `src/services/audit/**`
- `prisma/schema.prisma`

Trabajo:

- Crear endpoints CMS por dominio.
- Validar permisos server-side.
- Registrar audit log desde API.
- Mantener seeds como fallback demo.

Riesgo:

- Requiere decision DB/runtime. No asumir Postgres operativo sin validar entorno.

### 5. RBAC persistido

Archivos candidatos:

- `src/modules/cms/types.ts`
- `src/services/permissions/rbac.ts`
- `prisma/schema.prisma`

Trabajo:

- Persistir matriz role-permission.
- Versionar cambios.
- Requerir approval para cambios de permisos.

Riesgo:

- Roles runtime actuales son solo `admin` y `driver`; hay que mapearlos sin romper middleware.

### 6. Audit append-only

Archivos candidatos:

- `src/services/audit/auditLog.ts`
- `src/app/api/cms/audit-logs/**`
- `prisma/schema.prisma`

Trabajo:

- Guardar audit log en DB.
- Bloquear update/delete de audit entries.
- Exponer filtros por tenant, actor, modulo, resultado y fecha.

Riesgo:

- Si audit es opcional, el CMS no es enterprise.

### 7. Approval workflow real

Archivos candidatos:

- `src/app/api/cms/approvals/**`
- `src/components/admin/**`
- `src/modules/cms/types.ts`

Trabajo:

- Crear approval requests.
- Resolver approvals.
- Ejecutar mutacion productiva solo despues de approval.

Riesgo:

- Las acciones actuales mutan estado local inmediatamente.

### 8. CMS dashboard real

Archivos candidatos:

- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/AdminKpis.tsx`
- `src/app/api/cms/dashboard/**`

Trabajo:

- Leer KPIs desde API.
- Separar CEO view de operator view.
- Mostrar build status real o estado "not configured".

Riesgo:

- La UI actual mezcla demo, ops y venta.

## Tareas por agente

| Agente | Modulo | Tareas |
| --- | --- | --- |
| Codex Node | Governance | Mantener locks, revisar diffs, bloquear features fuera de fase. |
| Full Stack Agent | CMS backend | API, Prisma, tenant guard, RBAC, audit, approvals. |
| QA Agent | Regression | Smoke tests, auth tests, route tests, build validation. |
| UX/UI Agent | Admin UX | Separar panels, reducir densidad, arreglar textos visibles. |
| Maps Agent | Maps | Mantener fallback, auditar MapLibre/Google provider. |
| Telegram Agent | Notifications | Diseñar event router y webhook sin exponer tokens. |
| Bug Assistant Agent | Bug routing | Modelo BugReport, API, admin queue, routing. |
| Docs Agent | Specs | Mantener docs alineadas a codigo real. |

## Bloqueos previos

- No hay script `test`.
- No hay DB levantada validada en esta fase.
- No hay MapLibre dependency instalada.
- No hay backend CMS persistido.
- Hay cambios sin commit de fases anteriores.

## No tocar

- No reemplazar Zustand/store durante la primera particion UI.
- No eliminar `FleetTrackingMap` fallback.
- No conectar Google/Telegram en produccion sin secrets y terminos.
- No crear features nuevas dentro de una fase de hardening.
