# Node Orchestrator - Stable Build Plan

Rol base: Principal AI Node Orchestrator.

Objetivo: coordinar agentes para lograr una build estable, demostrable y vendible sin romper el proyecto.

## Principio Central

Estabilidad primero. Ningun agente implementa features si no hay contrato de datos, ownership claro y checks de build.

## Agentes Necesarios

### 1. Full Stack Core Agent

Responsable:

- NestJS backend.
- Prisma.
- PostgreSQL.
- Auth JWT.
- RBAC.
- Tenant middleware.
- Routes/Drivers/Incidents APIs.

No toca:

- UI visual salvo contrato API.
- Mapas.
- Copy comercial.

### 2. QA Stability Agent

Responsable:

- `npm run lint`.
- `npm run typecheck`.
- `npm run build`.
- Playwright.
- Regression checklist.
- Reporte P0/P1.

No toca:

- Features nuevas.

### 3. Demo Experience Agent

Responsable:

- `/demo`.
- Customer tracking.
- MapLibre fallback.
- Simulacion de camion.
- Demo sandbox reset.

No toca:

- Auth core.
- Prisma schema sin aprobacion.

### 4. Driver Experience Agent

Responsable:

- PWA driver.
- Mobile UX.
- Geolocation.
- Offline queue.
- Incident form mobile.

No toca:

- Admin CMS.

### 5. Operational Intelligence Agent

Responsable:

- ETA.
- SLA risk.
- Drop-off by zone.
- Route simulation.
- Auditabilidad de decisiones.

No toca:

- UI decorativa.

### 6. Security / RBAC Agent

Responsable:

- Cross-tenant isolation.
- Rate limiting.
- Cookie/JWT safety.
- Audit logs.
- Secret scanning.

No toca:

- Demo copy o mapas.

### 7. Documentation / Investor Readiness Agent

Responsable:

- README.
- CHANGELOG.
- Runbooks.
- Pilot docs.
- Demo script.
- Commercial narrative.

No toca:

- Codigo runtime salvo docs/config.

## Reglas De Coordinacion

1. Cada agente lee `docs/LOCKED_FILES.md`.
2. Cada agente declara archivos antes de editar.
3. No hay dos agentes editando el mismo archivo.
4. Cada ciclo termina con lint/typecheck/build.
5. Cada feature critica tiene audit log.
6. Cada endpoint protegido valida tenantId.
7. Ninguna decision critica se auto-aprueba.

## Secuencia Recomendada

### Cycle 0: Local Runtime

- Docker operativo.
- Postgres/Redis arriba.
- Prisma migrate + seed.
- App Next corriendo.

### Cycle 1: Backend Core

- NestJS.
- Auth.
- Tenant middleware.
- Routes/Drivers APIs.
- Audit logs.

### Cycle 2: Dispatcher Dashboard

- Dashboard real conectado a API.
- TanStack Query.
- MapLibre fallback.
- Approval workflow real.

### Cycle 3: Driver + Customer

- Driver PWA.
- Customer tracking public token.
- Position updates.

### Cycle 4: Demo Sandbox + Incidents

- Simulacion.
- Reset demo.
- Incidents end-to-end.

### Cycle 5: QA + Pilot Ready

- Playwright.
- CI.
- README.
- Security audit.
- Pilot checklist.

## Gate Para Pasar De Ciclo

No pasar de ciclo si:

- `npm run typecheck` falla.
- `npm run build` falla.
- DB no migra.
- Seed no corre.
- Login base no funciona.
- Hay acceso cross-tenant.
- Demo no corre sin API keys.

