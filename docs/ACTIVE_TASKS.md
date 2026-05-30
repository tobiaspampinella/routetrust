# Active Tasks

Last updated: 2026-05-30
Operating mode: New PC restore and beta stabilization
Governance owner: Principal AI Node Orchestrator

[TASK]
ID: RP-RESTORE-001
AGENT: Principal AI Node Orchestrator
ROLE: Technical Recovery Engineer
BRANCH: main (git initialization pending)
MODULE: Restore
STATUS: done
FILES_LOCKED: docs/RESTORE_REPORT.md, docs/ENVIRONMENT_SETUP.md, docs/INSTALLATION_REPORT.md
OBJECTIVE: Locate ZIP, restore into a clean folder, detect migration risks and validate local commands.
STARTED_AT: 2026-05-30
EXPECTED_FINISH: 2026-05-30
RISKS: PATH Node is blocked; Docker unavailable.
DEPENDENCIES: ZIP restored from RouteTrust folder.
NEXT_STEP: Initialize Git and open dependency hardening task.

[TASK]
ID: RP-RESTORE-002
AGENT: Principal AI Node Orchestrator
ROLE: QA Director
BRANCH: main (git initialization pending)
MODULE: Validation
STATUS: done
FILES_LOCKED: prisma/seed.ts, docs/QA_AUDIT.md
OBJECTIVE: Install dependencies, run lint/typecheck/build and smoke key pages.
STARTED_AT: 2026-05-30
EXPECTED_FINISH: 2026-05-30
RISKS: npm requires explicit Node PATH on this PC.
DEPENDENCIES: npm CLI downloaded to Codex temp.
NEXT_STEP: Add Playwright in QA slice.

[TASK]
ID: RP-GOV-001
AGENT: Principal AI Node Orchestrator
ROLE: AI Node Orchestrator
BRANCH: develop
MODULE: Governance
STATUS: done
FILES_LOCKED: none
OBJECTIVE: Refresh governance for restored repo and assign multiagent ownership.
STARTED_AT: 2026-05-30
EXPECTED_FINISH: 2026-05-30
RISKS: Parallel agents must follow ownership docs before editing shared files.
DEPENDENCIES: Restore audit complete.
NEXT_STEP: Start dependency hardening or Playwright smoke task.

[TASK]
ID: RP-FS-001
AGENT: Full Stack Engineer Agent
ROLE: Full Stack Engineer
BRANCH: agent/fullstack-core
MODULE: CMS/Auth/RBAC
STATUS: pending
FILES_LOCKED: src/app/api/**, src/services/**, prisma/schema.prisma
OBJECTIVE: Persist CMS core, tenant isolation, RBAC and audit logs after recovery branch is stable.
STARTED_AT: pending
EXPECTED_FINISH: Day 2
RISKS: Mock state must not be mistaken for tenant-safe persistence.
DEPENDENCIES: Git initialized, CI green, schema approved.
NEXT_STEP: Design persistence slice and tests.

[TASK]
ID: RP-QA-001
AGENT: QA Analyst Agent
ROLE: QA Analyst
BRANCH: agent/qa-stability
MODULE: Webtester
STATUS: pending
FILES_LOCKED: tests/**, playwright.config.ts, docs/QA_AUDIT.md
OBJECTIVE: Add Playwright coverage for critical beta flows.
STARTED_AT: pending
EXPECTED_FINISH: Day 6
RISKS: Some flows are mock/demo and need stable selectors.
DEPENDENCIES: Git initialized and app commands documented.
NEXT_STEP: Add Playwright smoke tests.

[TASK]
ID: RP-DEMO-001
AGENT: Demo Experience Engineer Agent
ROLE: Demo Experience Engineer
BRANCH: agent/demo-experience
MODULE: Demo Sandbox
STATUS: pending
FILES_LOCKED: src/lib/trackingSimulation.ts, src/store/routePulseStore.ts, src/components/customer/**, src/components/driver/**
OBJECTIVE: Formalize route simulation engine events and demo state sync.
STARTED_AT: pending
EXPECTED_FINISH: Day 3
RISKS: Do not add paid map dependency before fallback is stable.
DEPENDENCIES: QA smoke baseline.
NEXT_STEP: Write event contract and persist demo timeline.

[TASK]
ID: RP-MAPS-001
AGENT: Maps & Tracking Research Agent
ROLE: Maps Research Engineer
BRANCH: agent/maps-research
MODULE: Maps
STATUS: pending
FILES_LOCKED: docs/MAP_INTEGRATION.md, src/components/customer/**, .env.example
OBJECTIVE: Document Google/Apple/MapLibre options and implement MapLibre fallback without breaking missing-key mode.
STARTED_AT: pending
EXPECTED_FINISH: Day 4
RISKS: Premium APIs must stay optional.
DEPENDENCIES: Demo sandbox event contract.
NEXT_STEP: Create MAP_INTEGRATION doc and provider matrix.

[TASK]
ID: RP-TG-001
AGENT: Telegram Project Intelligence Agent
ROLE: Integration Engineer
BRANCH: agent/telegram-bot
MODULE: Telegram
STATUS: pending
FILES_LOCKED: src/app/api/cms/telegram/**, docs/TELEGRAM_BOT_SETUP.md, docs/TELEGRAM_EVENTS.md
OBJECTIVE: Add bot webhook/commands and project intelligence update format.
STARTED_AT: pending
EXPECTED_FINISH: Day 5
RISKS: Never expose full tokens in frontend or logs.
DEPENDENCIES: Env setup and auth guard review.
NEXT_STEP: Add command router spec.

[TASK]
ID: RP-BUG-001
AGENT: Bug Reporting Assistant Agent
ROLE: Support Automation Engineer
BRANCH: agent/bug-assistant
MODULE: Bug Assistant
STATUS: pending
FILES_LOCKED: src/components/shared/CxAssistantWidget.tsx, src/app/api/**, prisma/schema.prisma, docs/BUG_REPORTING_ASSISTANT.md
OBJECTIVE: Convert current assistant into structured bug reporting with local classification and critical Telegram routing.
STARTED_AT: pending
EXPECTED_FINISH: Day 5
RISKS: Do not depend on LLM for basic support replies.
DEPENDENCIES: BugReport storage decision.
NEXT_STEP: Add bug report contract and persistence fallback.
