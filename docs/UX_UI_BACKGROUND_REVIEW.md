# UX/UI Background Review

Owner: Claude Secondary (background engineering agent)
Date: 2026-06-02
Phase: FASE C — UX/UI audit (non-blocking, no redesign)
Status: First-pass static review. No UI files modified.

> Verification limit: shell did not boot, so the full `src/app` tree could not be
> enumerated and screens could not be rendered/screenshotted. This audit is based
> on direct reads of `src/app/login/page.tsx`, `src/app/track/demo/page.tsx`,
> `src/app/globals.css`, plus `BETA_STABLE_CRITERIA.md`. Items marked (inferred)
> come from internal status docs, not direct screen inspection. A full audit
> needs `npm run ux:audit` + browser smoke once the runtime is available.

## Positive findings
- A real design-token system exists in `globals.css` (HSL CSS vars: background,
  card, primary violet `258 91% 73%`, accent cyan, destructive, border, radius)
  plus reusable `ops-panel` / `ops-panel-soft` / `ops-card-glow` utilities. Good base.
- Login screen is polished: dark control-tower aesthetic, responsive grid,
  loading state ("Validando..."), inline error state styled, accessible labels.
- shadcn-style primitives in place (`Button`, `Card`, `Input`, `Label`).

## Issues

### UX-001 — Mixed language across the product (i18n inconsistency)
- page: global (login is Spanish, README/routes/scope are English)
- issue: Login copy is Spanish ("Acceso a una plataforma…", "Entrar",
  "Ver demo cliente") while the public README and product framing are English.
  For a public B2B demo this reads as unfinished.
- severity: P1 (blocks "vendible" demo polish)
- suggested fix: pick one primary demo language (recommend EN for the public repo)
  or add a light i18n string map; ship `README.es.md` for the ES audience.
- owner: UX/UI Agent (+ Docs for README.es)
- files suggested: `src/app/**/page.tsx` copy, future `src/lib/i18n`, `README.es.md`
- acceptance: a single demo language is consistent across login, admin, driver,
  tracking; or strings are centralized.

### UX-002 — Residual mojibake in untouched legacy strings (inferred)
- page: legacy/untouched screens
- issue: `BETA_STABLE_CRITERIA.md` and `ACTIVE_TASKS.md` both flag remaining
  mojibake (encoding corruption) in untouched UI strings.
- severity: P1
- suggested fix: grep for typical mojibake markers (Ã, Â, â€, ï¿½) across
  `src/app` and `src/components`, re-save files as UTF-8, fix affected strings.
- owner: UX/UI Agent
- files suggested: `src/app/**`, `src/components/**`
- acceptance: no mojibake markers remain; `npm run ux:audit` clean.

### UX-003 — Two coexisting visual languages (ops-* dark vs apple-* light)
- page: global CSS / customer tracking vs ops dashboards
- issue: `globals.css` defines both a dark "ops" system and a light "apple-*"
  system (`apple-hero-bg`, `apple-glass`, `apple-link`, `customer-map-*`).
  Customer tracking appears light/Apple-styled while ops screens are dark. Without
  a documented rule this risks an inconsistent enterprise feel.
- severity: P2
- suggested fix: document the intended split (ops = dark internal, customer =
  light external) in a short design-system note, or unify. Don't redesign.
- owner: UX/UI Agent (with Codex sign-off if structural)
- files suggested: `docs/DESIGN_SYSTEM.md` (new), `src/app/globals.css`
- acceptance: a one-page design-system doc states which surface uses which theme.

### UX-004 — Empty / loading / error states not verified beyond login
- page: admin dashboard, CMS, route approval, driver portal, customer tracking
- issue: login has loading+error states, but empty/loading/error coverage on the
  data-heavy screens (KPIs, incidents, approvals, tracking) is unverified and,
  given mock state, likely thin.
- severity: P2
- suggested fix: ensure every data view has explicit empty + loading + error
  states; standardize via a shared `<EmptyState>` / `<ErrorState>` component.
- owner: UX/UI Agent
- files suggested: `src/components/ui/*`, `src/app/admin/**`, `src/app/driver/**`
- acceptance: each listed screen renders a defined empty/loading/error state.

### UX-005 — Demo-mode affordance not explicit in-app (inferred)
- page: global
- issue: `DEMO_MODE=true` exists in env, but there is no confirmed persistent
  in-app "Demo / Beta" banner so customers/business managers understand data is
  simulated. Important for a public demo.
- severity: P2
- suggested fix: add a small persistent demo badge in the top nav when
  `DEMO_MODE` is on. Isolated, low-risk visual component.
- owner: UX/UI Agent
- files suggested: `src/components/layout/*` (new badge), nav components
- acceptance: a demo badge is visible across authenticated screens when demo mode on.

### UX-006 — Login "demo credentials" discoverability
- page: `/login`
- issue: login states credentials are local-only (correct for security) but a
  first-time demo user has no in-context hint on how to get them, creating a
  dead-end for evaluators.
- severity: P2
- suggested fix: link to `docs/DEMO_LOCAL_ONLY.md` from the login helper text, or
  show seeded demo creds only when `DEMO_MODE` is on and running locally.
- owner: UX/UI Agent
- files suggested: `src/app/login/page.tsx`
- acceptance: local demo users can reach valid credentials in one click.

## Recommended sequencing
P1 items (UX-001, UX-002) first — they most directly block a "sellable" public
demo. P2 items are polish. No mass redesign without Codex sign-off, per protocol.
