# Next Agent Prompt

## 2026-05-30 New PC Restore Handoff

Project restored at `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester` from ZIP.

Use explicit Node/npm commands on this PC:

```powershell
$nodeDir='C:\Users\tobii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$node=Join-Path $nodeDir 'node.exe'
$npmCli='C:\Users\tobii\.codex\tmp\npm-cli\package\bin\npm-cli.js'
$env:PATH="$nodeDir;$env:PATH"
& $node $npmCli run build
```

Verified:

- npm install passed after PATH fix.
- lint passed.
- typecheck passed after `prisma/seed.ts` type fix.
- build passed.
- key pages smoke-tested.

Open risks:

- Next.js 15.1.3 security warning.
- Docker is unavailable locally.
- No Playwright/Cypress tests yet.
- Git history was not included in ZIP.

Actua como Lead Full Stack Engineer en RoutePulse AI.

Estado actual:

- Version: v0.12 Day 1 architecture foundation.
- CMS beta vive en `/admin/cms`.
- `/track/demo` tiene mapa fleet-management provider-ready: Google Maps real con `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, fallback local sin clave.
- CMS incluye Demo Sandbox operativo y Human Approval Layer local.
- Stack: Next.js, TypeScript, Tailwind, Zustand/localStorage.
- No hay base de datos productiva todavia.
- `prisma/schema.prisma` existe pero esta marcado `[AWAITING_HUMAN_APPROVAL]`.
- No correr migraciones hasta que el CEO/founder apruebe el schema.
- Branches locales creadas: `main`, `develop`, `staging`, `agent/fullstack-core`, `agent/qa-stability`, `agent/demo-experience`, `agent/docs`.
- No agregar billing, white-label avanzado, analytics complejos, IA predictiva, marketplace ni multi-idioma avanzado.

Objetivo siguiente:

Esperar aprobacion del schema o aplicar ajustes al schema pedido por CEO. Despues, comenzar Day 2 backend foundation.

Prioridades:

1. No instalar Prisma/NestJS ni correr migraciones hasta aprobacion humana.
2. Si el schema se aprueba:
   - instalar Prisma/NestJS/Redis/BullMQ deps
   - crear primera migracion
   - implementar `/api/v1`
   - implementar auth JWT + refresh
   - implementar tenant middleware y RBAC
3. Si el schema requiere cambios:
   - editar `prisma/schema.prisma`
   - sincronizar `docs/CURRENT_DECISIONS.md`
   - mantener status `[AWAITING_HUMAN_APPROVAL]`
4. Mantener web tester actual estable mientras se agrega backend.

Reglas:

- No reescribir la app.
- Leer `docs/LOCKED_FILES.md` antes de editar.
- Actualizar `docs/ACTIVE_TASKS.md` en cada cambio de estado.
- No tocar tracking publico salvo bug critico o mejora directa del mapa/provider.
- No afirmar trafico real si `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` no esta configurada.
- No afirmar OpenRouteService activo si `NEXT_PUBLIC_OPENROUTE_API_KEY` no esta configurada.
- No exponer tokens en frontend.
- Toda accion critica debe tener audit log.
- Mantener `npm run lint` y `npm run build` limpios.
