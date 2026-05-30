# Next Agent Prompt

You are continuing RoutePulse AI after a new-PC ZIP restore.

## Current Evidence

- Project restored at `C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester`.
- ZIP source: `RoutePulseAI_Portable_Cycle0_2026-05-27.zip`.
- Stack: Next.js 15.1.3, React 19, TypeScript, Prisma 6, Tailwind, Zustand.
- npm install works only when PATH is prepended with bundled Node:
  `C:\Users\tobii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin`.
- `npm run lint`: passed.
- `npm run typecheck`: passed after fixing `prisma/seed.ts`.
- `npm run build`: passed.
- Smoke: `/`, `/login`, `/admin`, `/admin/cms`, `/driver`, `/track/demo` returned 200 or auth redirect 200.
- Telegram status API returns 401 without auth, expected.

## Do Next

1. Initialize Git if not already initialized.
2. Create first approved commit before creating `develop` and agent branches.
3. Address dependency hardening task for Next.js security warning.
4. Add Playwright smoke tests.
5. Start Day 2 CMS persistence/RBAC slice only after restore docs are reviewed.

## Do Not Do

- Do not add premium maps before fallback is stable.
- Do not expose Telegram or map keys.
- Do not claim beta stable until Playwright and CI pass.
- Do not refactor globally.
