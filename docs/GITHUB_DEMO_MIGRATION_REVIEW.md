# GitHub Demo Migration Review

Owner: Claude Secondary (background engineering agent)
Date: 2026-06-02
Phase: FASE B — GitHub public demo/test readiness
Status: First-pass review. No push performed. No code modified.

> Verification limit: sandbox shell did not boot this session. `git status`,
> `git remote -v` and `npm run build` could not be executed. Statements about
> the build and remote are inferred from `package.json`, `README.md` and
> `docs/BETA_STABLE_CRITERIA.md` and must be re-verified once the shell is up.

## Required questions

### 1. Can the public repo be set up locally?
**Partially.** `package.json` defines a standard `npm install` → `npm run dev`
flow and `README.md` documents it (`http://localhost:3000/login`). However full
local operation depends on PostgreSQL/Prisma (`db:up` uses `docker compose up -d
postgres`), and per `BETA_STABLE_CRITERIA.md` the product still runs largely on
Zustand local/mock state with **no production DB persistence**. So a fresh clone
can boot the demo UI, but a clean "clone → install → run with seeded data" path
is not yet proven end-to-end. Needs a verified, documented demo-seed path.

### 2. Are there secrets?
No secrets were found in the inspected files. `.env.example` contains empty
placeholders only and `SECURITY.md` enforces a no-committed-secrets policy.
A full automated scan is still pending (see Sanitization Review).

### 3. Are there personal local paths?
None found in the files inspected. A repo-wide grep for `C:\Users\tobii\` is
still required before export. **Note:** the repo currently bundles a local
PostgreSQL/pgAdmin binary tree under `runtime/postgres/` — not a personal path,
but it must not ship to a public repo (size + platform-specific binaries).

### 4. Is there private information?
The future "private core" infrastructure (real backend, tenants, auth, audit,
tracking tokens) is not separated yet, but most of it is also **not built yet**
(the app is demo/mock per the beta criteria). Internal status docs
(`ACTIVE_TASKS.md`, agent prompts) exist and should be excluded from the public
export. No customer data, leads or cost data were found in inspected files.

### 5. Are the instructions clear?
Mostly yes. `README.md` is well structured: scope, install, validation, scripts,
routes, security, limits. Gaps: (a) no `README.es.md` despite a partly-Spanish
UI; (b) demo seed / demo credentials path is described as "local-only" but the
actual one-command demo bootstrap is not spelled out; (c) `.github/workflows/ci.yml`
is referenced — its real contents were not verified this session.

### 6. Is it clearly understood to be demo-beta?
**Yes.** README repeatedly and accurately frames the project as beta /
not-production / local-demo, and `Current Limits` is explicit about no prod
persistence, no realtime sync, no prod tenant isolation, no prod identity. This
honesty is good and should be preserved.

### 7. What is missing before the push?
- **P0:** exclude `runtime/postgres/` (and the rest of `runtime/`) from the public
  repo. Shipping a bundled DB binary publicly is the top blocker.
- **P0:** run a real secret scan + `git status` review before export.
- **P1:** private/public separation infra (strategy, sensitive-files policy,
  export script, `.public-demo-ignore`). None exist yet — Codex-owned.
- **P1:** verified clone→install→seed→run demo path, documented.
- **P2:** `README.es.md`; confirm `.github` issue/PR templates and `ci.yml` content.
- **P2:** confirm `git remote -v` points at the intended public repo before any push.

## Push guidance
Do **not** push yet. No force-push. Resolve the two P0 items and complete the
secret scan first. The export should be a filtered/sanitized copy, not a push of
the working tree as-is.
