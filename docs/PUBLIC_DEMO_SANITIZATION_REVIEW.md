# Public Demo Sanitization Review

Owner: Claude Secondary (background engineering agent)
Date: 2026-06-02
Phase: FASE A — Private/Public migration review
Status: First-pass review. Non-blocking. No code modified.

## Scope and method

This review checks whether the repository is safe to export as a public demo/beta
repo without leaking the future private core, secrets, credentials, personal paths
or detailed vulnerabilities. It was produced by static reading of repository files.

> Verification limit: the sandbox shell did not boot in this session, so a
> repository-wide `git grep` for secrets and personal paths, and `git status`
> for Codex's uncommitted working tree, could **not** be executed. The findings
> below are based on direct reads of the highest-risk files. A full automated
> secret scan (`npm run qa:security` / `git grep`) must still be run before any
> public push. Treat this document as "no obvious leaks found in inspected files",
> not "cleared".

## Summary verdict

| Question | Answer |
|---|---|
| Secrets committed in inspected files? | No (placeholders only) |
| Personal local paths (`C:\Users\tobii\...`) in inspected files? | None found in inspected files; full grep pending |
| `.gitignore` excludes the sensitive surface? | Largely yes — see gaps below |
| Private/public separation infrastructure present? | **No — not yet created by Codex** |
| Safe to push public today? | **No** — separation infra + full secret scan required first |

## What was inspected

- `.gitignore` — comprehensive, see analysis below.
- `.env.example` — all secret values are empty placeholders. Safe.
- `SECURITY.md` — clean policy; contains a security-contact email (intentional).
- `README.md` — no local paths, no secrets, accurate "not production-ready" framing.
- `docs/ACTIVE_TASKS.md`, `docs/BETA_STABLE_CRITERIA.md` — internal status, no secrets.
- `src/app/login/page.tsx`, `src/app/track/demo/page.tsx`, `src/app/globals.css` — no secrets.

## `.gitignore` analysis

Already excluded (good): `.env`, `.env.local`, `.env.*.local`, `.env.production`,
`.env.staging`, `logs/`, `*.log`, `runtime/heartbeats/`, `runtime/logs/`,
`runtime/project-status.json`, `runtime/local-ops-status.json`, `docs/private/`,
`docs/agent-logs/`, several `data/runtime/*.json` (audit-log, bug-reports,
bug-dispatches, project-events), `backups/`, `dumps/`, `*.bak`, `*.sqlite*`,
`*.pem`, `*.key`, `*.p12`, `*.cer`, `*.crt`.

Gaps to close before public export (recommended, not yet applied):

1. **`runtime/` is only partially ignored.** Only specific subpaths
   (`heartbeats/`, `logs/`, `autonomous/*.log`, `github-sync/*.log`,
   `local-model/*.tmp`, `reports/*.tmp`) are excluded. The rest of `runtime/`
   is trackable. This repo currently contains a **bundled PostgreSQL + pgAdmin
   binary distribution under `runtime/postgres/`** (hundreds of MB of `.exe`/`.dll`).
   That must **never** reach a public GitHub repo — it is huge, platform-specific,
   and not source. Add `runtime/postgres/` (and ideally `runtime/opencode/`,
   `runtime/claude-secondary/`, `runtime/autonomous/`, `runtime/github-sync/`,
   `runtime/local-model/`, `runtime/reports/`) to the public-export ignore set.
2. **`docs/internal/` and `docs/security-internal/`** are referenced by the agent
   prompt as sensitive but are not in `.gitignore` (only `docs/private/` is).
   Add them.
3. **`.env.example.local`** is ignored but the more general `*.local` env variants
   are covered; confirm no `.env.example` derivative carries real values.
4. **Prompt / strategy files** (`runtime/opencode/next-codex-prompt.md`,
   internal NEXT_AGENT_PROMPT, leads/prospect/cost docs) — none confirmed present,
   but the export filter must exclude them by pattern, not by enumeration.

## Required exclusions for the public demo (target list)

The public export must drop: `.env*` (except `.env.example`), `runtime/`
(entire tree, especially `runtime/postgres/`), `data/runtime/*` sensitive JSON,
`docs/private/`, `docs/internal/`, `docs/security-internal/`, all logs,
heartbeats, backups, dumps, DB files, tokens/keys, `DATABASE_URL`/`AUTH_SECRET`
real values, Telegram tokens, any `C:\Users\...` personal path, detailed
vulnerability write-ups, internal prompts, internal strategy, and leads/cost data.

## Missing separation infrastructure (FASE A blocker)

None of the following exist yet:

- `docs/PRIVATE_PUBLIC_REPO_STRATEGY.md`
- `docs/SENSITIVE_FILES_POLICY.md`
- `docs/PUBLIC_DEMO_EXPORT_POLICY.md`
- `.public-demo-ignore` / `.private-only-files.md`
- `scripts/export-public-demo.js`
- `docs/PUBLIC_DEMO_GITHUB_SETUP.md`

These are Codex-owned (they define the private/public boundary and an export
script that filters files). Rather than pre-empt that design, a handoff has been
prepared at `runtime/claude-secondary/codex-handoff.md`.

## Recommended next actions

1. **P0 before any push:** add `runtime/postgres/` to `.gitignore` (or the export
   ignore list). A bundled DB binary in a public repo is the single biggest risk here.
2. Run a real secret scan once the shell is available: `npm run qa:security` and
   `git grep -nIE "AUTH_SECRET|JWT_SECRET|TELEGRAM_BOT_TOKEN|postgresql://[^l]"`.
3. Run `git status` to confirm no sensitive uncommitted file is staged before export.
4. Have Codex create the export script + policy docs (see handoff).
