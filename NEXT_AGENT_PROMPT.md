# Next Agent Prompt

## 2026-05-31 Git recovery handoff

Completed in this pass:

- Confirmed `origin` is `https://github.com/tobiaspampinella/routetrust.git`.
- Diagnosed the rejected push correctly: unrelated histories, not a meaningful remote codebase.
- Confirmed `origin/main` only had the bootstrap `Initial commit` with a tiny `README.md`.
- Created local checkpoint commit `620636e chore(repo): checkpoint local RouteTrust recovery state`.
- Ran `git pull origin main --allow-unrelated-histories`.
- Resolved the only merge conflict in `README.md` by keeping the local RouteTrust content.
- Created merge commit `0b11b4d merge: integrate remote bootstrap README into RouteTrust history`.
- Pushed `main` successfully to `origin`.

Current reality:

- Remote `main` now contains the RouteTrust history.
- `develop`, `staging` and `stabilization/beta-saas-v0.1` are still local-only.
- Labels, topics, branch protection and remote CI verification are still pending.
- Repository visibility is not verified from this machine.

Next allowed move:

- Verify Actions on GitHub, then push `develop`, `staging` and `stabilization/beta-saas-v0.1`, and apply labels/topics/protection.

## 2026-05-31 GitHub publication handoff

Completed in this pass:

- Confirmed the real repository path is `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`.
- Verified local Git state, current branch, missing remote and dirty worktree.
- Ran `npm test`, `npm run qa:security`, `npm run typecheck`, `npm run lint` and `npm run build`.
- Added `docs/GITHUB_PUBLICATION_REPORT.md`.
- Reworked `README.md`, `SECURITY.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/labels.yml` and `.gitignore`.
- Added `docs/GITHUB_LABELS_APPLY.md` and `docs/GITHUB_BRANCH_PROTECTION_MANUAL_STEPS.md`.

Hard blockers:

- `gh` is not installed on this machine.
- Remote CI, topics, labels and branch protection cannot be verified until the GitHub repository is created.

What is ready:

- Public-facing repo docs are substantially cleaner.
- Security disclosure now has a real email contact.
- Roadmap is milestone-based instead of sprint-only.
- Manual commands exist for preferred repo `tobiaspampinella/routetrust` and alternate `tobiaspampinella/routetrust-operational-intelligence`.

Next allowed move:

- Install/authenticate GitHub CLI or create the private GitHub repo manually, then push `main`, `develop`, `staging` and `stabilization/beta-saas-v0.1`.

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

## 2026-06-01 Supervised Runtime Handoff

Immediate operating state:

- Runtime source of truth: `runtime/project-status.json`.
- Dynamic dashboard: `/admin/project-status`.
- Local bug queue: `/admin/bug-reports`.
- Commands:
  - `npm run agent:scheduler`
  - `npm run agent:runner`
  - `npm run agents:status`
  - `npm run watchdog:once`
  - `npm run locks:sync`
  - `npm run locks:check`
  - `npm run ux:audit`
  - `npm run debug:scan`
  - `npm run qa:security`
  - `npm run bugs:triage`
  - `npm run telegram:status`
  - `npm run telegram:test`

Current blocker:

- Telegram remains blocked until `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` exist in `.env.local`.

What is real:

- Supervised Node processes, heartbeats, reports, lock checks and runtime JSON.
- No autonomous LLM workers.
- No fake active processes.

What still requires manual supervision:

- `npm run dev`
- `npm run agent:scheduler`
- browser verification
- code changes

Do not claim agents are working unless `agents:status` shows active processes or recent supervised evidence.

## 2026-06-01 RouteTrust Recovery Operator Handoff

Immediate operating state:

- Package manager: npm.
- Dev command: `npm run dev`.
- Local URL: `http://127.0.0.1:3000`.
- Project status page: `/admin/project-status`.
- Operational commands:
  - `npm run agents:status`
  - `npm run beta-check`
  - `npm run telegram:test`
- Dev server status doc: `docs/DEV_SERVER_STATUS.md`.
- Agent runtime status doc: `docs/AGENT_RUNTIME_STATUS.md`.

Current blocker:

- Telegram test cannot deliver externally until `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured.

Do not proceed to CMS, maps or Telegram bot work until the dev server remains visible and operational checks pass.

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
