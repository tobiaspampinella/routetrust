# Next Agent Prompt

## 2026-06-01 RouteTrust UX orchestration handoff

Completed in this pass:

- confirmed the active repository scope and working tree boundaries
- verified the required bilingual docs and design-system files exist
- upgraded the UX/UI agent prompts so they now enforce gating, ownership, route coverage, deliverables, and beta honesty
- implemented the missing `/admin/drivers` business-manager surface and connected it into admin navigation
- fixed the bilingual README switch so public entry no longer shows mojibake
- hardened `npm run ux:audit` coverage to reflect real missing routes, missing state components, missing language toggle, and missing visual QA evidence
- kept UX findings connected to `docs/ACTIVE_TASKS.md` owners across full stack, GitHub repo, and QA/web tester flows

Current blockers:

- required public SaaS routes are still missing: `/contact`, `/demo`, `/pricing` or `/plans`, `/product`, `/use-cases`, `/customers`
- shared `EmptyState`, `LoadingState`, and `ErrorState` components are still missing
- the product still lacks a visible `LanguageToggle` surface
- browser QA evidence for the required route set is still blocked or absent

Do not claim beta stable.

Next priority order:

1. full stack: implement or explicitly de-scope missing public SaaS pages
2. full stack: add reusable empty/loading/error states and a visible language toggle on public surfaces
3. QA/web tester: capture browser evidence for `/login`, `/`, `/track/demo`, `/admin`, `/admin/project-status`, `/admin/cms`, `/driver`, `/driver/route`
4. GitHub repo agent: tighten bilingual README/docs presentation only after implementation and QA reality are aligned
