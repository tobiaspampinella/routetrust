# Public Demo Export Plan

Goal: produce a sanitized, GitHub-ready public demo of RouteTrust that ships the runnable
product (app + demo seed) without leaking secrets, personal paths, internal ops tooling, or the
future private core.

## How to export

```bash
npm run export:public-demo
```

Output: `dist-public-demo/` (gitignored). Exit code is non-zero if the secret scan finds anything.

## Strategy — allowlist, not denylist

Only explicitly-approved paths are copied; everything else is excluded by construction.

**Included**
- `src/`, `public/`, `prisma/` (schema + demo seed), `tests/`
- Config: `next.config.ts`, `tsconfig*.json`, `tailwind.config.ts`, `postcss.config.mjs`,
  `next-env.d.ts`, `.eslintrc.json`, `.eslintignore`, `playwright.config.ts`
- `.env.example` (sanitized — generic placeholder credentials only)
- `README.md`, `CREDITS.md`, `LICENSE` (if present), curated `docs/` (e.g. `MAPS_STRATEGY.md`)
- Generated: sanitized `package.json` (public scripts only), `.github/workflows/ci.yml`,
  a public `.gitignore`, `EXPORT_MANIFEST.json`

**Excluded (never shipped)**
- `.env`, `.env.local` and any real secrets
- `runtime/`, `data/runtime/` (logs, heartbeats, local Postgres, runtime stores)
- `scripts/` (autonomous ops tooling), `agents/`
- Internal/ops docs (status, audits, vulnerability reviews, GitHub-prep, autonomous policies)
- `node_modules/`, `.next*`, `test-results/`, `playwright-report/`

## Sanitization

- `package.json` is regenerated with only public scripts (`dev`, `build`, `start`, `lint`,
  `test`, `typecheck`, `qa:e2e`, `db:*`) — no agent/ops/telegram/github automation.
- `.env.example` connection string is rewritten to generic `user:password` placeholders.

## Secret scan (fail-closed)

Every text file in the export is scanned for: local user paths (`C:\Users\…`), non-empty
`AUTH_SECRET`/`ROUTEPULSE_DEMO_SECRET`, committed `routetrust-local-*` secrets, Telegram bot
tokens, DB URLs with real credentials, and OpenAI/Anthropic keys. The placeholder-only
`.env.example` is exempt from the DB-URL pattern by design. Any finding fails the export.

## Before any public push

1. `npm run export:public-demo` → must exit 0 (scan clean).
2. Review `dist-public-demo/EXPORT_MANIFEST.json`.
3. Run the repo's own `npm run qa:security` on the source for a second opinion.
4. Confirm the curated docs subset contains no internal strategy.
5. Initialize/push `dist-public-demo/` as the public repo (not this private working tree).

This is the safe path the sanitization review (`docs/PUBLIC_DEMO_SANITIZATION_REVIEW.md`) flagged
as missing — now implemented.
