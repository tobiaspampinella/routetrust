# RouteTrust

[English](README.md) | [Español](README.es.md)

RouteTrust es una plataforma de inteligencia operacional para logística construida con IA y orquestada por humanos.

Este repositorio contiene la base beta actual de RouteTrust para:

- tracking de clientes
- visibilidad para business managers
- ejecución de rutas para drivers
- KPIs operativos
- control demo mediante CMS
- intake supervisado de bugs

Es una beta local controlada. No es un TMS productivo, un ERP ni una plataforma de despacho autónomo.

## Posicionamiento del Producto

RouteTrust está diseñado para dos audiencias operativas:

- Clientes que necesitan tracking claro, ETA, estado, visibilidad de retrasos y confianza.
- Business managers que necesitan KPIs operativos, estado de rutas, estado de drivers, incidencias, bugs y verdad del sistema.

Posicionamiento central:

- construido con IA
- orquestado por humanos
- claro para operaciones
- presentable para enterprise
- honesto sobre sus límites beta

## Estado Actual

- La app beta local existe.
- Las superficies de admin, driver, tracking de cliente y drivers existen.
- La documentación UX y del repositorio está en proceso de endurecimiento.
- La evidencia QA en navegador sigue incompleta.
- No se afirma readiness productivo.

## Documentación Pública

- [README.md](README.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CONTRIBUTING.es.md](CONTRIBUTING.es.md)
- [SECURITY.md](SECURITY.md)
- [SECURITY.es.md](SECURITY.es.md)
- [ROADMAP.md](ROADMAP.md)
- [ROADMAP.es.md](ROADMAP.es.md)
- [BETA_STABLE_CRITERIA.md](BETA_STABLE_CRITERIA.md)
- [BETA_STABLE_CRITERIA.es.md](BETA_STABLE_CRITERIA.es.md)
- [AI_BUILT_PROJECT.md](AI_BUILT_PROJECT.md)
- [AI_BUILT_PROJECT.es.md](AI_BUILT_PROJECT.es.md)
- [docs/product/VALUE_PROPOSITION.es.md](docs/product/VALUE_PROPOSITION.es.md)
- [docs/design/DESIGN_SYSTEM.es.md](docs/design/DESIGN_SYSTEM.es.md)
- [docs/design/UX_AUDIT_REPORT.es.md](docs/design/UX_AUDIT_REPORT.es.md)
- [docs/GITHUB_REPO_PRESENTATION.es.md](docs/GITHUB_REPO_PRESENTATION.es.md)

## Superficies del Producto

Públicas:

- `/`
- `/login`
- `/track/demo`

Business manager:

- `/admin`
- `/admin/routes`
- `/admin/drivers`
- `/admin/kpis`
- `/admin/cms`
- `/admin/project-status`
- `/admin/bug-reports`
- `/admin/settings`

Driver:

- `/driver`
- `/driver/route`

Las rutas públicas de marketing como `/contact`, `/product`, `/use-cases`, `/customers` y `/demo` todavía no existen y quedan registradas como gaps de producto.

## Design System

RouteTrust está migrando a un sistema visual operacional centrado en:

- superficies graphite y neutras oscuras
- azul operacional como acento principal
- verde para éxito
- amber para advertencias
- rojo para incidencias
- layouts de bajo ruido y dashboards densos pero legibles

Archivos fuente:

- `src/design-system/tokens.ts`
- `src/design-system/colors.ts`
- `src/design-system/typography.ts`
- `src/design-system/spacing.ts`
- `src/design-system/components.md`

## Quickstart

Requisitos:

- Node.js 22+
- npm

```bash
npm install
npm run dev
```

Abrir:

```txt
http://localhost:3000/login
```

## Validación

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run ux:audit
```

Validación opcional en navegador:

```bash
npm run qa:smoke
```

## Límites Beta

- Todavía existen runtime local y persistencia local en partes del producto.
- QA en navegador sigue siendo requisito antes de llamar estable a un build.
- Telegram y proveedores externos de mapas siguen siendo opcionales o bloqueados por configuración.
- La aprobación humana sigue siendo obligatoria para releases, decisiones críticas de producto y cambios operativos sensibles.

## Modelo de Contribución

Ver [CONTRIBUTING.es.md](CONTRIBUTING.es.md). Los cambios relevantes deben actualizar:

- `CHANGELOG.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/ACTIVE_TASKS.md` cuando cambien ownership o siguientes pasos

## Seguridad

Ver [SECURITY.es.md](SECURITY.es.md). La documentación pública está redactada a propósito y no debe contener secretos, detalles de explotación, credenciales personales ni datos de contacto personales innecesarios.
