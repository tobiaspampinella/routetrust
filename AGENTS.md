# RoutePulse AI Agent Guidelines

- Current execution mode: Beta SaaS Controlada v0.1 stabilization.
- Work as a coordinated SaaS product team, but do not claim enterprise readiness while persistence, tenant isolation and auth remain beta-grade.
- Every cycle must leave verifiable output: code, docs, config, tests, CI or a server check.
- Use branch `stabilization/beta-saas-v0.1` for this stabilization work.
- Track local issues in `docs/ISSUES.md` until a GitHub remote exists.
- Do not implement Telegram webhook, billing, advanced AI, microservices or enterprise white-label before server, CI, auth, QA and minimum persistence are stable.
- Este proyecto es primero un web tester, no un TMS enterprise completo.
- No integrar APIs externas hasta que el flujo mock este completo y validado.
- No reemplazar codigo existente si puede extenderse de forma incremental.
- Priorizar cambios pequenos, testeables y alineados al flujo demo.
- Mantener el flujo admin-driver-customer tracking.
- El diferencial del producto es ETA predictivo + control operativo + KPIs para ultima milla LatAm.
- El posicionamiento es AI-built, human-orchestrated Operational Intelligence Platform; no comunicar que la IA reemplaza humanos.
- Las decisiones criticas deben pasar por Human Approval Layer.
- Toda nueva logica de KPI o ETA debe estar en funciones puras testeables.
- Mantener la UI simple, profesional y demostrable.
- No agregar backend real, app nativa ni IA avanzada en este tester.
- Google Maps puede usarse solo de forma legal y configurable con `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; nunca hardcodear claves ni prometer trafico real si la clave no existe.
- Apple MapKit queda provider-ready hasta tener token, cuenta y terminos aprobados.
- El CMS admin debe crecer de forma incremental y persistir en estado local mientras no exista backend real.
- Mantener version visible en footer y documentar cambios en `SOFTWARE_LOG.md`.
- Las rutas privadas deben seguir protegidas por middleware y sesion HTTP-only.

## Executable Agent Runtime

Runtime source of truth:

1. Documented agents: `agents/*`.
2. Executable scripts: `scripts/*`.
3. Active processes: live Node.js process markers in `docs/agent-logs/*.running.json`.

Do not report an agent as active unless a real process is running.

## Agent Roster

| Agent | Directory | Branch | Runtime command |
| --- | --- | --- | --- |
| Codex Node | `agents/codex-node` | `agent/codex-node` | `node scripts/agent-runner codex-node` |
| Full Stack Agent | `agents/fullstack-engineer` | `agent/fullstack-core` | `node scripts/agent-runner fullstack-engineer` |
| QA Agent | `agents/qa-analyst` | `agent/qa-stability` | `node scripts/agent-runner qa-analyst` |
| Operational Auditor | `agents/operational-auditor` | `agent/operational-audit` | `node scripts/agent-runner operational-auditor` |
| Demo Engineer | `agents/demo-engineer` | `agent/demo-sandbox` | `node scripts/agent-runner demo-engineer` |
| Maps Agent | `agents/maps-agent` | `agent/maps-fallback` | `node scripts/agent-runner maps-agent` |
| Telegram Agent | `agents/telegram-agent` | `agent/telegram-bot` | `node scripts/agent-runner telegram-agent` |
| Bug Assistant Agent | `agents/bug-assistant-agent` | `agent/bug-assistant` | `node scripts/agent-runner bug-assistant-agent` |
| UX Agent | `agents/ux-agent` | `agent/ux-review` | `node scripts/agent-runner ux-agent` |
| Full Stack Bug Fix Agent | `agents/fullstack-bug-fix-agent` | `agent/fullstack-bugfix` | `node scripts/agent-runner fullstack-bug-fix-agent` |
| QA Validation Agent | `agents/qa-validation-agent` | `agent/qa-validation` | `node scripts/agent-runner qa-validation-agent` |
| Cybersecurity Validation Agent | `agents/cybersecurity-validation-agent` | `agent/security-validation` | `node scripts/agent-runner cybersecurity-validation-agent` |
| Bug Triage Agent | `agents/bug-triage-agent` | `agent/bug-triage` | `node scripts/agent-runner bug-triage-agent` |
| Local Website Assistant Agent | `agents/local-website-assistant-agent` | `agent/local-assistant` | `node scripts/agent-runner local-website-assistant-agent` |
| Docs Agent | `agents/docs-agent` | `agent/docs` | `node scripts/agent-runner docs-agent` |

## Runtime Commands

- `npm run agents:status`
- `npm run agents:report`
- `npm run agents:run -- <agent-id>`
- `npm run agents:run -- <agent-id> --hold-ms=30000`
- `npm run agents:qa`
- `npm run agents:telegram`
- `npm run agents:beta-check`
- `npm run dev:dashboard`
- `npm run qa:build`
