# RouteTrust OpenCode Agent Schedule

Last updated: 2026-06-01T21:00:00.000Z
Mode: OpenCode/minimax-m3 fallback while Codex GPT-5.5 recovers tokens.

This document is the source of truth for the cadencia operativa while Codex is offline. The machine-readable mirror is `runtime/opencode/schedule.json`.

## Principio rector

OpenCode NO corre todos los agentes todo el tiempo. Cada agente corre solo si pasa el gating completo: hay cambios, hay tarea, hay senal P0/P1, no esta en cooldown, no hay archivos bloqueados, no requiere Codex, y tiene permiso para modificar el area objetivo.

## Cadencia por agente

### 24/7 (sin cooldown agresivo)

| Agente | Intervalo | Modifica codigo | Compromete | Push | Prioridad |
| --- | ---: | :---: | :---: | :---: | --- |
| Runtime Watchdog | 30 min | NO | NO | NO | alta |
| Bug Triage | 60 min | NO | NO | NO | alta |
| Local Documentation | 2-4 h | NO | NO | NO | media |

### Recurrentes (con cooldown y ventana)

| Agente | Intervalo | Cooldown | Modifica codigo | Compromete | Push | Prioridad |
| --- | ---: | ---: | :---: | :---: | :---: | --- |
| Node Orchestrator | 2 h | 90 min | solo P0/P1 | SI (sin push) | NO | critica |
| QA Analyst | 4 h | 3 h | NO | NO | NO | alta |
| GitHub Repository | 6 h | 6 h | SI (README/docs/.github/CHANGELOG) | SI | SI (cooldown 6h) | media-alta |
| UX/UI Designer | 24 h | 20 h | SI (solo con task) | NO | NO | media |
| Cybersecurity | 24 h | 20 h | NO (salvo .gitignore/docs) | NO | NO | critica |
| Product/Chief Strategy | semanal (10080 min) | 5 d | NO | NO | NO | media |

### Task-only (no corren por reloj)

| Agente | Modo | Restriccion |
| --- | --- | --- |
| Database/Prisma | task-only | requiere P0/P1; no migraciones destructivas; no inventar DATABASE_URL |
| Backend Real | task-only | requiere P0/P1; no UI salvo integracion minima |
| Frontend Product | task-only | requiere task asignada; no DB/auth |
| DevOps/Staging | task-only | sin secrets; no production |
| Maps & Tracking | task-only | sin APIs pagas sin autorizacion humana |

## Gating

Antes de ejecutar cualquier agente, validar:

1. `git-changed-since-last-execution` — hubo cambios relevantes desde la ultima corrida real del agente.
2. `open-task-exists` — hay tarea abierta para ese agente.
3. `P0-or-P1-signal` — hay senal real de bug o check fallido.
4. `interval-or-fixed-window-reached` — se cumplio el intervalo o la ventana fija.
5. `cooldown-not-active` — el cooldown ya expiro.
6. `no-locked-file-conflict` — ningun task claimant tiene archivos bloqueados que se pisen.
7. `human-approval-not-required` — la accion no es un limite humano.
8. `agent-permitted-to-modify-area` — el agente tiene permiso para el area destino.
9. `db-auth-security-impact-assessed` — si toca DB/auth/security, se evalua escalacion.
10. `codex-required-check` — si la accion es critica y requiere Codex GPT-5.5, se skipea con `SKIPPED_REQUIRES_CODEX`.

## Codigos de skip

- `SKIPPED_NO_CHANGES`
- `SKIPPED_NO_TASKS`
- `SKIPPED_COOLDOWN`
- `SKIPPED_MANUAL_REQUIRED`
- `SKIPPED_REQUIRES_CODEX`
- `SKIPPED_BLOCKED`
- `SKIPPED_DRIFT`
- `SKIPPED_LOCKED_FILES`

## Permisos por area

| Area | Quien puede tocar | Quien NO puede |
| --- | --- | --- |
| `src/` | Frontend Product (UI), Backend Real (API), UX/UI (con task) | Documentation, Bug Triage, Watchdog |
| `prisma/` | Database/Prisma (P0/P1) | Cualquier otro |
| `src/lib/auth/`, `src/app/api/auth/` | Backend Real (P0/P1) | Frontend, UX |
| `docs/` | Documentation, GitHub Repository, Node Orchestrator | UX, QA |
| `runtime/` | Watchdog, Node Orchestrator, Triage | Implementadores |
| `scripts/` | Node Orchestrator, DevOps, Backend | Documentation |
| `.github/`, `README*`, `CHANGELOG*` | GitHub Repository | Forzoso (push con cooldown) |
| `.env*`, secrets | Humano unicamente | Cualquier agente |

## Exclusiones de ruido (no cuentan como cambio)

- `runtime/heartbeats/`
- `runtime/logs/`
- `runtime/reports/`
- `runtime/agent-budget.json`
- `runtime/agent-last-run.json`
- `runtime/project-status.json`
- `runtime/watchdog-state.json`
- `runtime/opencode/heartbeat.json`
- `docs/agent-reports/*` (excepto cuando el agente los escribe)
- `docs/AGENT_RUNTIME_STATUS.md`
- `docs/DAILY_CONTROL_REPORT.md`
- `docs/OPEN_CODE_RUNTIME_STATUS.md`
- `docs/OPEN_CODE_NEXT_ACTIONS.md`

## Arranque manual equivalente

- `npm run agent:scheduler` — corre el planificador con la cadencia definida.
- `npm run agent:runner` — ejecuta un agente puntual si pasa gating.
- `npm run watchdog` — levanta el watchdog.
- `npm run ops:daily-summary` — resumen diario.
- `node scripts/agent-status` — estado de los agentes.
- `npm run project:status` — estado del proyecto.
- `npm run beta-check` — chequeo de beta.

## Limites humanos (no negociables)

- Activar mapas pagos (Google, Mapbox de pago) requiere aprobacion humana.
- Cambiar `DATABASE_URL` de produccion o `NEXTAUTH_SECRET` requiere humano.
- Force push requiere aprobacion humana explicita.
- Publicar una vulnerabilidad en `docs/SECURITY_AUDIT.md` requiere revision humana previa.
- Decisions de staging y produccion son siempre humanas.
- Credenciales externas (Telegram bot, OAuth, billing) son humanas.
