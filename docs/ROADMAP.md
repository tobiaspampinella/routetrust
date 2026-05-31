# Roadmap - RoutePulse SaaS Beta

## Current Objective

Stabilize the project as **Beta SaaS Controlada v0.1**: executable locally, traceable in Git, verified by CI, honest about demo/local limitations, and ready for small incremental backend hardening.

## Phase 0 - Project ignition

- Verify Node/npm path and dependency install.
- Run typecheck, tests, lint, build and production audit.
- Start Next.js dev server and document local URL.
- Keep existing routes intact.

Exit criteria: app builds, test suite passes, dev server responds locally, known audit issues are recorded.

## Phase 1 - GitHub and traceability

- Work on `stabilization/beta-saas-v0.1`.
- Keep documentation useful and current.
- Ensure CI runs test/typecheck/lint/build.
- Track issues locally until a GitHub remote exists.

Exit criteria: README, env, CI, roadmap, architecture, issues, QA and security docs describe the real beta state.

Current GitHub status: no remote is configured.

Commands to connect a GitHub repository later:

```powershell
git remote -v
git remote add origin <github-repo-url>
git push -u origin stabilization/beta-saas-v0.1
```

If committing the current stabilization branch after reviewing the existing dirty worktree:

```powershell
git add .github/workflows/ci.yml .env.example AGENTS.md CHANGELOG.md README.md docs/ARCHITECTURE.md docs/ISSUES.md docs/QA.md docs/ROADMAP.md docs/SECURITY.md
git commit -m "chore: stabilize beta SaaS baseline"
git push -u origin stabilization/beta-saas-v0.1
```

## Phase 2 - Critical security

- Upgrade Next.js/PostCSS to remove critical production vulnerabilities.
- Re-run full verification: typecheck, test, lint, build, audit.
- Avoid broad framework changes beyond the security fix.

Exit criteria: `npm audit --omit=dev` has no critical production vulnerabilities.

## Phase 3 - Real CI

- Keep `.github/workflows/ci.yml` aligned with local commands.
- Add tests whenever a new backend/security behavior is introduced.

Exit criteria: workflow contains `npm ci`, typecheck, lint, test and build.

## Phase 4 - Auth hardening

- Remove silent production secret fallback.
- Keep demo users only for local beta.
- Add auth tests around token signing/verification and invalid credentials.
- Consider bcryptjs migration if scope remains small.

Exit criteria: no silent default secret in production, tests pass, env contract documented.

## Phase 5 - Minimum persistence

- Start with bug reports, then audit logs, then incidents.
- Add Prisma model and API persistence for the chosen module.
- Keep frontend changes minimal.

Exit criteria: one module no longer depends on process memory or localStorage.

## Phase 6 - Tenant and RBAC base

- Centralize tenant resolution.
- Reduce repeated `tenant-demo-latam` hardcodes.
- Keep role labels honest until persisted auth exists.

Exit criteria: tenant context has a single helper and API paths use it consistently.

## Phase 7 - B2B role UX

- Align visible copy to RoutePulse SaaS Beta.
- Add module structure for Admin, Operations, CX, CS, Finance/CFO, Direction, Driver and Tracking.
- Mark incomplete views as `Beta module - pending backend integration`.

Exit criteria: app looks like a controlled B2B beta, not a generic demo.

## Deferred

- Billing.
- Telegram webhook and commands.
- Advanced AI prediction.
- Enterprise white-label.
- Native mobile apps.
