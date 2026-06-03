# RouteTrust — 7-Day Build Roadmap

Owner: Tobias Ammann Pampinella (original idea & orchestration)
Build models: GPT-5.5 (Codex lane) · Claude Opus 4.8 (Claude Code lane)
Working mode: one **verified** unit per turn (typecheck + lint + build + e2e + browser check),
token-conscious, pause for renewal at a clean boundary.

## Goal (end of 7 days)
1. Operational SaaS web app, deployable on any logistics platform — front + back running
   together **locally**, zero bugs / no crashes.
2. Polished product/marketing website.
3. GitHub repo updated with a formal, impeccable presentation (+ credits).

## Status legend
done · in progress · pending

## Already delivered (before Day 1)
- ✅ Base stabilization: green build, hardened session secret, lint fix, Playwright smoke.
- ✅ UI design-system primitives (table, states, tabs, drawer, select, textarea, alert).
- ✅ Public website: landing, product, use-cases, contact, updates (Apple style + animations).
- ✅ Operational CMS modules: Drivers, Incidents (KPIs, search, filters, drawer CRUD).

---

## Day 1 — Operational core: Approvals + Routes
- ⬜ **Approvals module** (`/admin/approvals`) — the product's heart: AI suggestion vs current
  route, ETA savings, SLA risk, driver assignment, approve / modify / reject + **audit log**.
  - Store: add an `approvals` queue and an `auditLogs` entry per decision.
- ⬜ Refactor `/admin/routes` onto the shared primitives (keep simulation logic intact).

## Day 2 — Complete the CMS surface + dashboard
- ⬜ Remaining operational modules to the same pattern where data exists: Vehicles, Stops, Users.
- ⬜ **Audit Logs** view (`/admin/audit-logs`) reading the new audit entries.
- ⬜ Admin **Dashboard** (`/admin`) polish: honest data-state badges (Demo / DB / Not configured).

## Day 3 — Driver portal + Customer tracking
- ⬜ `/driver` mobile-first redesign with primitives: route, next stop, ETA, big actions
  (Start / Arrived / Delivered / Report incident).
- ⬜ `/track` polish: MercadoLibre-clear timeline, ETA, status states (prepared → delivered →
  incident), light surface.

## Day 4 — Front + Back together, LOCALLY
- ⬜ Wire CMS modules to API routes where present (`/api/cms/*`, `/api/bugs`) with a
  `file_fallback` adapter **only** in `DEMO_MODE`; health reports the mode honestly.
- ⬜ Integration pass: front + back run jointly with no 500s. **No destructive Prisma** (Codex lane).

## Day 5 — Maps + stability hardening
- ⬜ Maps providers (`mock` / `maplibre`) with safe fallback, no API-key dependency, documented limits.
- ⬜ Bug sweep + expand e2e (authenticated admin flows). Target: zero crashes.

## Day 6 — Public Demo export (GitHub prep)
- ⬜ `scripts/export-public-demo.js`: exclude `.env*`, `runtime/`, logs, local `C:\Users\…` paths,
  secrets, private docs, detailed vulns. Include seed demo + clean READMEs + basic CI.
- ⬜ Sanitization review pass.

## Day 7 — GitHub formal presentation + credits + final QA
- ⬜ Impeccable `README.md`: hero, value prop, screenshots, honest status, setup, demo mode.
- ⬜ `CREDITS.md` / `AUTHORS`: original idea & merit **Tobias Ammann Pampinella**; built by
  **GPT-5.5** + **Claude Opus 4.8**, human-orchestrated.
- ⬜ `LICENSE` + repo metadata; final full QA pass (typecheck/lint/build/e2e/beta-check).

---

## Standing guardrails
- Honest readiness always (no fake production-ready). `beta-check` is the gate.
- No secrets committed; `runtime/` and `.env*` never leave local.
- Coordinate the DB/Prisma lane with Codex (see `docs/LOCKED_FILES.md`).
- Every turn ends on a green, reviewable tree.
