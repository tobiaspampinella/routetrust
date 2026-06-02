# RouteTrust OpenCode Next Actions

Last refreshed: 2026-06-01T21:30:00.000Z (after Database/Prisma pass)
Owner: RouteTrust Node Orchestrator (OpenCode/minimax-m3, fallback window)
Branch: `codex/P1-autonomous-ops`

Esta lista prioriza acciones que OpenCode SI puede ejecutar mientras Codex GPT-5.5 recupera tokens. Las que requieren Codex o humano estan marcadas explicitamente.

## DB/Prisma pass summary (2026-06-01)

- Docker not available in this environment. Honored `DB_LOCAL_BLOCKED_NO_DOCKER`.
- `docker-compose.yml` updated to add `container_name: routetrust-postgres` and rename volume to `routetrust_postgres_data`.
- `docs/LOCAL_POSTGRES_SETUP.md` added: manual install path for Windows installer, Homebrew, apt, plus psql user/db creation.
- `docs/DB_LOCAL_STATUS.md` added: honest snapshot, decision log, and what was NOT modified and why.
- `bugStore.ts`, `health/route.ts`, `beta-check` and `schema.prisma` already implement the spec — no changes needed.
- See `runtime/opencode/queue.json` items `OPENCODE-008` (codex-required migration) and `OPENCODE-011` (developer picks up local setup).

## Inmediato (proxima hora)

1. `OPENCODE-002` — Clasificar las 167 entradas de `git status --short`. Owner: github-repository-agent (OpenCode). Bloqueado por: nada. Resultado esperado: lista `runtime/opencode/git-classification.json` con 3 buckets (commiteable, ignorable, requiere-decision). NO pushear.
2. `OPENCODE-004` — Refrescar `docs/OPEN_CODE_RUNTIME_STATUS.md` con el ultimo `project-status.json`. Owner: local-model-documentation. Bloqueado por: nada.
3. `OPENCODE-005` — Correr triage sobre `data/runtime/bug-reports.json` y dejar evidencia en `runtime/opencode/bug-triage.json`. Owner: bug-triage. Bloqueado por: nada.
4. `OPENCODE-006` — Audit diario de seguridad. Buscar `AUTH-001` (demo secret fallback), validar `.env.example` y `.gitignore`. Owner: cybersecurity. Bloqueado por: nada.

## Corto plazo (hoy)

5. `OPENCODE-007` — Atacar UXR-005 (mojibake cleanup) en `LandingPage.tsx`, `AdminDashboard.tsx`, `DriverRoute.tsx`, `CustomerTrackingDemo.tsx`. Owner: frontend-product-agent con task asignada. Bloqueado por: codex o humano para el push final.
6. `OPENCODE-009` — Re-correr `qa:smoke` y `qa:security`, anexar evidencia. Confirmar que el unico fallo real es health 200 por runtime drift, no por bug de codigo. Owner: qa-analyst. Bloqueado por: nada.
7. `OPENCODE-010` — Bilingual sync de `README/CHANGELOG` una vez clasificadas las 167 entradas. Owner: github-repository-agent. Bloqueado por: `OPENCODE-002`.

## Para Codex GPT-5.5 (cuando tenga tokens)

- `OPENCODE-001` — Restart oficial del proceso en puerto 3000; cerrar runtime drift. Requiere decision humana sobre managed process y push del fix.
- `OPENCODE-008` — Prisma + `DATABASE_URL` + primera migracion. Decision critica de schema, sin inventar la URL.
- AUTH-001 (demo secret fallback) — eliminar fallback silencioso.
- TENANT-001 — centralizar tenant context antes de staging.
- Decision de staging (crear `STAGING-001`).

## Backlog observado (no para OpenCode directo)

- STAGING-001 (P2 en BLOCKERS.md) — no hay URL de staging. Requiere Codex + DevOps + humano.
- MAPS-001 (P2) — mapas siguen en fallback. Requiere decision humana sobre provider.
- TELEGRAM-001 (P2) — bot opcional sin credenciales. Mantener opcional.

## Riesgos identificados

- **Worktree sucio (167 entries)** — bloquea claim de BETA_STABLE_READY. Riesgo alto si se pushea sin clasificar.
- **No upstream en `codex/P1-autonomous-ops`** — un `git push` ingenuo fallara. Requiere `git push -u origin codex/P1-autonomous-ops` o cambio de estrategia.
- **`/api/health` cae a 0** — posiblemente porque el servidor no esta sirviendo en este momento. La cadencia de watchdog deberia detectar caida y reintentar arranque solo si esta autorizado.
- **Runtime drift** — si el watchdog decide reiniciar sin autorizacion, puede romper cosas. Por eso `OPENCODE-001` queda como Codex-required.
- **Codex sin tokens** — si OpenCode toma decisiones grandes, se pierde la supervision. Por eso el gating 10/10 es estricto.

## Politica de salida

Cuando Codex GPT-5.5 vuelva a tener tokens:

1. OpenCode entrega el estado en `runtime/opencode/status.json` + `docs/OPEN_CODE_RUNTIME_STATUS.md`.
2. Codex valida `runtime/opencode/queue.json` y decide que hacer con cada item `codexRequired`.
3. OpenCode se repliega a modo `monitor-only` (solo watchdog, bug-triage, documentation, QA recurrente) hasta que Codex cierre la sesion o ceda el control explicitamente.
4. Cualquier accion de push/merge/deploy queda en hold hasta aprobacion de Codex o humano.

## Comandos utiles durante esta ventana

- `node scripts/agent-status`
- `npm run project:status`
- `npm run beta-check`
- `npm run qa:smoke` (si esta disponible y pasa gating)
- `npm run watchdog`
- `node scripts/agent-budget`
- `node scripts/agent-cooldown`
- `node scripts/agent-priority`
