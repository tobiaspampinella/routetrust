# FASE 5 - Active Tasks

Last updated: 2026-06-01
Mode: Stable build activation

[TASK]
ID: CORE-001
AGENT: Codex Node
ROLE: Principal Project Orchestrator
BRANCH: main
MODULE: Beta Core / Governance / Integration
STATUS: done
FILES_LOCKED:
OBJECTIVE: Implement minimum beta core contracts, tests, docs, verification and handoff.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Existing working tree includes uncommitted files from previous phases.
DEPENDENCIES: User authorized FASE 5.
NEXT_STEP: Replanificar tareas activas para backend real, persistencia y hardening de stable build.

[TASK]
ID: FS-002
AGENT: Full Stack Agent
ROLE: Lead Full Stack Engineer
BRANCH: agent/fullstack-core
MODULE: CMS / Route Engine / Incidents
STATUS: done
FILES_LOCKED:
OBJECTIVE: Add local incidents, route simulation engine hookup and CEO beta overview without backend refactor.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Incidents and approvals remain local-state beta only.
DEPENDENCIES: Existing Zustand demo state.
NEXT_STEP: Implement persistent API/DB, starting with the minimum durable backend path.

[TASK]
ID: QA-002
AGENT: QA Agent
ROLE: QA Director
BRANCH: agent/qa-stability
MODULE: Tests / Regression
STATUS: done
FILES_LOCKED:
OBJECTIVE: Add minimum automated tests for pure beta contracts.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: No Playwright regression suite yet.
DEPENDENCIES: `tsx` already available in devDependencies.
NEXT_STEP: Add browser smoke tests for admin, driver and tracking.

[TASK]
ID: UX-002
AGENT: UX/UI Agent
ROLE: UX Lead
BRANCH: agent/ux-admin
MODULE: Admin Dashboard / Driver UX
STATUS: done
FILES_LOCKED:
OBJECTIVE: Add CEO overview and basic driver incident reporting without broad redesign.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Existing app still has mojibake in untouched screens.
DEPENDENCIES: Current UI primitives.
NEXT_STEP: Fix remaining encoding and add UX smoke tests.

[TASK]
ID: MAPS-002
AGENT: Maps Agent
ROLE: Maps & Tracking Engineer
BRANCH: agent/maps-fallback
MODULE: Maps Fallback
STATUS: done
FILES_LOCKED:
OBJECTIVE: Keep mock fallback active and prevent accidental Google activation outside google provider mode.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: MapLibre is still mock/fallback only, not a real dependency.
DEPENDENCIES: No external map API required.
NEXT_STEP: Evaluar e integrar proveedor real de mapas/trafico bajo criterio legal y tecnico.

[TASK]
ID: TG-002
AGENT: Telegram Agent
ROLE: Telegram Integration Engineer
BRANCH: agent/telegram-bot
MODULE: Telegram Project Intelligence Bot
STATUS: done
FILES_LOCKED:
OBJECTIVE: Add basic protected project intelligence report and optional Telegram send.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Requires env variables to send externally; skips safely without secrets.
DEPENDENCIES: Existing CMS permission guard.
NEXT_STEP: Telegram descartado temporalmente; no continuar esta linea hasta nueva decision.

[TASK]
ID: BUG-002
AGENT: Bug Assistant Agent
ROLE: Support Automation Engineer
BRANCH: agent/bug-assistant
MODULE: Bug Reporting Assistant
STATUS: done
FILES_LOCKED:
OBJECTIVE: Add basic authenticated bug intake and local routing.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Bug reports are in-memory and not durable.
DEPENDENCIES: Existing session cookie.
NEXT_STEP: Persist bug reports and add admin queue over real backend storage.

[TASK]
ID: DOCS-002
AGENT: Docs Agent
ROLE: Documentation Lead
BRANCH: agent/docs
MODULE: Changelog / Criteria / Handoff
STATUS: done
FILES_LOCKED:
OBJECTIVE: Document FASE 5 implementation and remaining stable-build blockers.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-05-31
RISKS: Browser smoke tests are still pending.
DEPENDENCIES: Implementation diff.
NEXT_STEP: Add smoke evidence in next stable-build hardening phase.

[TASK]
ID: OPS-003
AGENT: Codex Node
ROLE: Principal Project Orchestrator
BRANCH: main
MODULE: Runtime supervision / Scheduler / Watchdog
STATUS: pending
FILES_LOCKED:
OBJECTIVE: Convert the local runtime into a supervised, visible, non-fake operation with scheduler, heartbeats, watchdog and project-status JSON.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-06-01
RISKS: Runtime can drift from docs if scripts stop writing project-status.
DEPENDENCIES: Existing Node runtime scripts.
NEXT_STEP: Keep scheduler, watchdog and beta-check aligned around the local operations baseline.

[TASK]
ID: UXR-003
AGENT: UX/UI Agent
ROLE: UX Lead
BRANCH: agent/ux-admin
MODULE: Project status dashboard / Demo / Driver / Customer
STATUS: pending
FILES_LOCKED:
OBJECTIVE: Audit core visible surfaces and produce a UX runtime report.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-06-01
RISKS: Untouched screens still contain encoding issues.
DEPENDENCIES: Dynamic runtime dashboard data.
NEXT_STEP: Run `npm run ux:audit` after the project status page is dynamic.

[TASK]
ID: DBG-003
AGENT: Full Stack Debug Agent
ROLE: Runtime Debug Engineer
BRANCH: agent/fullstack-debug
MODULE: Runtime routes / APIs / Demo / Tracking
STATUS: pending
FILES_LOCKED:
OBJECTIVE: Scan the runtime surface for broken routes, missing files and obvious backend/frontend faults.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-06-01
RISKS: Static scanning cannot replace browser verification.
DEPENDENCIES: Runtime scripts and route files.
NEXT_STEP: Run `npm run debug:scan`.

[TASK]
ID: SEC-003
AGENT: QA Security Agent
ROLE: Security QA Lead
BRANCH: agent/qa-security
MODULE: Auth / RBAC / Secrets / Protected routes
STATUS: pending
FILES_LOCKED:
OBJECTIVE: Validate baseline auth and secret handling with repeatable local checks.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-06-01
RISKS: No end-to-end browser auth suite yet.
DEPENDENCIES: Existing auth routes and server guards.
NEXT_STEP: Run `npm run qa:security`.

[TASK]
ID: LBA-003
AGENT: Local Bug Assistant Agent
ROLE: Local Triage Assistant
BRANCH: agent/local-bug-assistant
MODULE: Local bug assistant / Bug queue / Routing
STATUS: pending
FILES_LOCKED:
OBJECTIVE: Keep a local bug queue with category, severity and routing evidence.
STARTED_AT: 2026-05-31
EXPECTED_FINISH: 2026-06-01
RISKS: Bug queue is still local-state only and not yet durable.
DEPENDENCIES: `data/runtime/bug-reports.json` and runtime routing scripts.
NEXT_STEP: Run `npm run bugs:triage`.

[TASK]
ID: UXR-004
AGENT: fullstack-developer-agent
SOURCE: ux-ui-product-designer-agent
MODULE: public product marketing routes
PAGE: /contact, /demo, /product, /use-cases, /customers, /pricing or /plans
SEVERITY: P1
OBJECTIVE: Implement the missing public SaaS routes or remove them from product claims and README scope.
FILES_SUGGESTED: src/app/contact/page.tsx, src/app/demo/page.tsx, src/app/product/page.tsx, src/app/use-cases/page.tsx, src/app/customers/page.tsx, src/app/pricing/page.tsx
ACCEPTANCE_CRITERIA: Public pages exist, read clearly in English-first product language, and match RouteTrust positioning without copied branding.
STATUS: pending

[TASK]
ID: UXR-005
AGENT: fullstack-developer-agent
SOURCE: ux-ui-product-designer-agent
MODULE: shared copy and state system
PAGE: /, /admin, /track/demo, /driver/route
SEVERITY: P1
OBJECTIVE: Remove mojibake and replace corrupted UI strings with verified enterprise copy.
FILES_SUGGESTED: src/components/shared/LandingPage.tsx, src/components/admin/AdminDashboard.tsx, src/components/customer/CustomerTrackingDemo.tsx, src/components/driver/DriverRoute.tsx
ACCEPTANCE_CRITERIA: No visible mojibake remains in audited core surfaces.
STATUS: pending

[TASK]
ID: UXR-006
AGENT: fullstack-developer-agent
SOURCE: ux-ui-product-designer-agent
MODULE: reusable operational states
PAGE: /admin/project-status, /admin/cms, /driver/route, shared widget
SEVERITY: P2
OBJECTIVE: Add reusable empty, loading and error state components to audited operational surfaces.
FILES_SUGGESTED: src/components/shared, src/app/admin/project-status/page.tsx, src/app/admin/cms/page.tsx, src/components/driver/DriverRoute.tsx, src/components/shared/CxAssistantWidget.tsx
ACCEPTANCE_CRITERIA: Each audited operational screen exposes explicit empty/loading/error guidance.
STATUS: pending

[TASK]
ID: UXR-007
AGENT: github-repository-agent
SOURCE: ux-ui-product-designer-agent
MODULE: bilingual repo presentation
PAGE: repository root
SEVERITY: P2
OBJECTIVE: Keep README/docs bilingual navigation, enterprise positioning and public repo structure aligned with implementation reality.
FILES_SUGGESTED: README.md, README.es.md, docs/GITHUB_REPO_PRESENTATION.md, docs/GITHUB_REPO_PRESENTATION.es.md
ACCEPTANCE_CRITERIA: Public repo docs are bilingual, internally consistent and free of fake production claims.
STATUS: pending

[TASK]
ID: UXR-008
AGENT: qa-web-tester-agent
SOURCE: ux-ui-product-designer-agent
MODULE: visual smoke evidence
PAGE: /login, /, /track/demo, /admin, /admin/project-status, /admin/cms, /driver, /driver/route
SEVERITY: P1
OBJECTIVE: Run visual smoke after mojibake cleanup and attach evidence to docs/design/VISUAL_QA_REPORT.md.
FILES_SUGGESTED: tests/e2e/smoke.spec.ts, docs/design/VISUAL_QA_REPORT.md, docs/design/VISUAL_QA_REPORT.es.md
ACCEPTANCE_CRITERIA: Pages load without broken layout, invisible buttons, mojibake or basic responsive failure.
STATUS: pending

[TASK]
ID: UXR-009
AGENT: fullstack-developer-agent
SOURCE: ux-ui-product-designer-agent
MODULE: business manager navigation completeness
PAGE: /admin/drivers
SEVERITY: P1
OBJECTIVE: Implement the missing drivers management surface or remove references to it from the admin navigation and docs.
FILES_SUGGESTED: src/app/admin/drivers/page.tsx, src/components/admin/AdminShell.tsx, README.md, docs/design/BUSINESS_MANAGER_EXPERIENCE.md
ACCEPTANCE_CRITERIA: `/admin/drivers` exists with a readable operational baseline, or the route is fully de-scoped from visible navigation and public docs.
STATUS: done
