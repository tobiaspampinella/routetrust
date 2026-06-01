# FASE 2 - Agent Ownership

Fecha: 2026-05-31

## Codex Node

Responsable:

- governance
- architecture
- integration
- handoffs

Branch sugerida: `agent/codex-node`

Archivos primarios:

- `docs/PROJECT_OPERATING_SYSTEM.md`
- `docs/AI_GOVERNANCE.md`
- `docs/ACTIVE_TASKS.md`
- `docs/CURRENT_DECISIONS.md`
- `docs/NEXT_AGENT_PROMPT.md`

## Full Stack Agent

Responsable:

- CMS
- backend
- RBAC
- route engine

Branch sugerida: `agent/fullstack-core`

Archivos primarios:

- `src/app/api/**`
- `src/services/**`
- `src/modules/**`
- `prisma/schema.prisma`

## QA Agent

Responsable:

- tests
- webtester
- regression

Branch sugerida: `agent/qa-stability`

Archivos primarios:

- `tests/**`
- `playwright.config.*`
- `cypress.config.*`
- `docs/QA_AUDIT.md`

## UX/UI Agent

Responsable:

- admin dashboard
- demo UX
- driver UX

Branch sugerida: `agent/ux-admin`

Archivos primarios:

- `src/components/admin/**`
- `src/components/driver/**`
- `src/components/customer/**`
- `src/app/globals.css`

## Full Stack Debug Agent

Responsable:

- runtime debugging
- route health
- endpoint surface
- CMS/Demo/Driver/Tracking validation

Branch sugerida: `agent/fullstack-debug`

Archivos primarios:

- `src/app/**`
- `src/app/api/**`
- `docs/FULLSTACK_DEBUG_REPORT.md`

## QA Security Agent

Responsable:

- auth validation
- RBAC validation
- tenant isolation checks
- secret handling

Branch sugerida: `agent/qa-security`

Archivos primarios:

- `src/app/api/auth/**`
- `src/services/**`
- `.env.example`
- `docs/SECURITY_AUDIT.md`
- `docs/QA_SECURITY_REPORT.md`

## Local Bug Assistant Agent

Responsable:

- local bug triage
- category routing
- severity assignment
- critical escalation

Branch sugerida: `agent/local-bug-assistant`

Archivos primarios:

- `data/runtime/bug-reports.json`
- `src/components/shared/CxAssistantWidget.tsx`
- `src/app/admin/bug-reports/**`
- `docs/BUG_TRIAGE_REPORT.md`

## Maps Agent

Responsable:

- maps fallback
- Google Maps research
- traffic integration

Branch sugerida: `agent/maps-research`

Archivos primarios:

- `docs/MAP_INTEGRATION.md`
- map/tracking components
- `.env.example`

## Telegram Agent

Responsable:

- Telegram bot
- project updates

Branch sugerida: `agent/telegram-bot`

Archivos primarios:

- `src/app/api/cms/telegram/**`
- `docs/TELEGRAM_BOT_SETUP.md`
- `docs/TELEGRAM_EVENTS.md`

## Bug Assistant Agent

Responsable:

- internal bug chatbot
- bug routing

Branch sugerida: `agent/bug-assistant`

Archivos primarios:

- `src/components/shared/CxAssistantWidget.tsx`
- bug report API/model
- `docs/BUG_REPORTING_ASSISTANT.md`

## Docs Agent

Responsable:

- README
- specs
- changelog

Branch sugerida: `agent/docs`

Archivos primarios:

- `README.md`
- `docs/**`
- `CHANGELOG.md`
- `docs/CHANGELOG.md`

## Support Agents

Antigravity/Gemini:

- auditoria operacional
- UX enterprise
- analisis de friccion logistica

OpenCode/Vibecode:

- tests pequenos
- fixtures
- mocks
- bugs aislados

Regla: Support Agents no modifican core sin task, branch y lock.
