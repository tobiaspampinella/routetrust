# Next Agent Prompt - Supervised Runtime

## 2026-06-01 Runtime stabilization handoff

Completed in this pass:

- `.next` cleanup executed successfully
- `npm test` passing
- `npm run typecheck` passing
- `npm run build` passing
- `/`, `/login`, `/track/demo` returning `200` in dev
- `/admin` returning `307` unauthenticated
- `/api/bugs` returning `401` unauthenticated
- `/api/cms/telegram/status` returning controlled `200`
- `/api/cms/telegram/test` returning controlled `400`

Root cause addressed:

- base `tsconfig.json` was still coupled to generated Next artifacts
- Telegram missing-env behavior was not explicit enough for stabilization

Do not expand scope yet:

- no feature work
- no CMS expansion
- no Telegram real integration
- no map/provider work
- no GitHub remote work

Next allowed move:

- resolve `beta-check` governance/watchdog failures and static status-page debt

## Estado inmediato

- Runtime JSON: `runtime/project-status.json`
- Dashboard dinamico: `/admin/project-status`
- Cola local de bugs: `/admin/bug-reports`
- Scripts principales:
  - `npm run agent:scheduler`
  - `npm run agents:status`
  - `npm run watchdog:once`
  - `npm run locks:check`
  - `npm run ux:audit`
  - `npm run debug:scan`
  - `npm run qa:security`
  - `npm run bugs:triage`

## Bloqueador actual

- Telegram sigue bloqueado sin `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.

## Regla central

- No afirmar autonomia.
- Solo hay operacion supervisada local.
- Si `agents:status` no muestra procesos activos, no inventar actividad.

## Siguiente paso operativo

1. Levantar `npm run dev`.
2. Levantar `npm run agent:scheduler`.
3. Revisar `/admin/project-status`.
4. Ejecutar smoke visual/manual.

---

Rol: Codex Recovery Agent / Principal Project Orchestrator.

## Estado autorizado

FASE 5 - BETA CORE IMPLEMENTATION ejecutada en el tester local.

No avanzar a FASE 6 sin autorizacion humana.

## Workspace

`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`

## Implementado en FASE 5

- `npm run test` agregado con `tsx --test src/lib/*.test.ts`.
- Route Simulation Engine puro:
  - `src/lib/routeSimulationEngine.ts`
  - `src/lib/routeSimulationEngine.test.ts`
- Telegram Project Intelligence:
  - `src/lib/projectIntelligence.ts`
  - `src/lib/projectIntelligence.test.ts`
  - `src/app/api/cms/telegram/project-intelligence/route.ts`
- Bug Reporting Assistant basico:
  - `src/lib/bugReporting.ts`
  - `src/lib/bugReporting.test.ts`
  - `src/app/api/bugs/route.ts`
  - `src/components/shared/CxAssistantWidget.tsx`
- Incident Management basico:
  - `OperationalIncident` en `src/lib/types.ts`
  - incidents seed en `src/data/mockData.ts`
  - `reportIncident` y `resolveIncident` en `src/store/routePulseStore.ts`
  - driver incident reporting en `src/components/driver/DriverRoute.tsx`
- CMS/Admin CEO overview:
  - `src/components/admin/AdminDashboard.tsx`
- Map fallback hardening:
  - `src/components/customer/FleetTrackingMap.tsx`
- Version visible:
  - `src/lib/version.ts` -> `v0.14`

## Verificacion ejecutada

- `npm run test`: pasa 6/6.
- `npm run typecheck`: pasa despues de corregir seleccion de `incidents` en `AdminKpis`.
- `npm run lint`: pasa sin warnings ni errores.
- `npm run build`: pasa; genera 21 rutas incluyendo `/api/bugs` y `/api/cms/telegram/project-intelligence`.
- HTTP smoke en `next start -p 3001`:
  - `/`: 200
  - `/login`: 200
  - `/track/demo`: 200
  - `/api/bugs` sin sesion: 401 esperado
  - `/api/auth/login` admin: 200
  - `/api/bugs` POST autenticado: 201
  - `/api/cms/telegram/project-intelligence` autenticado: 200
  - `/api/auth/login` driver: 200
  - `/driver/route` con sesion driver: 200

## Verificacion pendiente antes de declarar stable build

- Browser visual smoke manual o Playwright para:
  - `/login`
  - `/admin`
  - `/admin/cms`
  - `/driver/route`
  - `/track/demo`

## Riesgos actuales

- Bug reports son in-memory, no persistentes.
- Incidents son Zustand/localStorage, no DB.
- Human Approval Center sigue siendo local-state.
- Audit logs siguen siendo locales en CMS.
- Telegram Project Intelligence solo envia si existen `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.
- MapLibre sigue siendo mock/fallback, no provider real.
- Queda mojibake en pantallas no tocadas.
- No hay `/health`.
- No hay Playwright suite.

## Siguiente fase recomendada

FASE 6 - STABLE BUILD HARDENING:

1. Ejecutar lint/build.
2. Corregir fallos sin refactor global.
3. Agregar `/health`.
4. Agregar smoke tests browser.
5. Persistir bug reports/incidents solo si se autoriza backend local.
6. Limpiar encoding visible restante.
