# Stabilization Report

Date: 2026-06-01
Scope: runtime, build, typecheck, critical HTTP smoke only

## Freeze and snapshot

- Current branch: `stabilization/beta-saas-v0.1`
- Local changes detected at snapshot: `76`
- `git diff --stat`: large dirty worktree already present before this stabilization pass
- Package manager used: `npm`

## Scripts available

- `dev`
- `dev:dashboard`
- `build`
- `start`
- `lint`
- `test`
- `typecheck`
- `agents:status`
- `agents:report`
- `agents:run`
- `agents:qa`
- `agents:telegram`
- `agents:beta-check`
- `beta-check`
- `telegram:test`
- `qa:build`

## Initial state observed in this run

- `npm run typecheck`: pass, but only because the script uses `tsconfig.typecheck.json`
- `tsconfig.json`: still coupled to generated artifacts via `.next/types/**/*.ts` and `.next-app/types/**/*.ts`
- `npm run build`: pass before cleanup in this workspace, but prior audits had recorded `.next` instability and module resolution failure from generated output
- Dev server at `127.0.0.1:3000`: not trusted as baseline until restarted from a clean `.next`

## Current risks at start

- Base TypeScript config depended on generated folders that may not exist after cleanup.
- Previous runtime failures were consistent with stale or corrupt Next build artifacts.
- Telegram endpoints needed explicit non-500 behavior when env vars are missing.
- Dirty worktree means this pass must stay narrow and avoid feature work.

## Phase 2 - Next artifact cleanup

Safe cleanup executed:

- removed `.next`
- checked `.turbo`
- checked `out`
- checked `dist`
- checked `build`

Result:

- cleanup completed successfully
- no source, docs, public assets, or lockfiles removed

## Phase 3 - tsconfig correction

File changed:

- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\tsconfig.json`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\tsconfig.json)

Change made:

- removed `.next/types/**/*.ts`
- removed `.next-app/types/**/*.ts`
- replaced broad generated includes with explicit project includes:
  - `next-env.d.ts`
  - `*.ts`
  - `*.tsx`
  - `prisma/**/*.ts`
  - `src/**/*.ts`
  - `src/**/*.tsx`

Reason:

- base config must not require generated Next artifacts to exist
- `next-env.d.ts` stays in place
- project sources remain fully included

Result:

- `npm run typecheck`: PASS after cleanup

## Phase 4 and 5 - critical route review

Files reviewed:

- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\page.tsx`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\page.tsx)
- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\login\page.tsx`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\login\page.tsx)
- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\track\demo\page.tsx`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\track\demo\page.tsx)
- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\api\cms\telegram\status\route.ts`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\api\cms\telegram\status\route.ts)
- [`C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\api\cms\telegram\test\route.ts`](C:\Users\tobii\OneDrive\Documents\RouteTrust\routepulse-ai-tester\src\app\api\cms\telegram\test\route.ts)

Telegram fixes applied:

- `/api/cms/telegram/status` now returns:
  - `configured`
  - `missing`
  - `status`
- `/api/cms/telegram/test` now returns controlled `400` when env is missing:
  - `sent: false`
  - `status: "missing_configuration"`
  - `missing`

Reason:

- missing Telegram env is an expected configuration state, not a server error

## Validation results

- `npm test`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS after cleaning `.next`
- `npm run beta-check`: FAIL
  - not due to runtime/build/typecheck
  - blocked by unrelated runtime-governance files and lock/watchdog inconsistencies
- `npm run agents:status`: PASS with warnings

## Root cause found

- The real instability risk in this pass was the coupling of base TypeScript config to generated Next artifacts plus prior reliance on stale `.next` state.
- Telegram endpoints also used a looser response contract for missing env and needed explicit stabilization.

## Remaining blockers outside this stabilization scope

- `beta-check` still fails because required governance docs are missing and watchdog/lock metadata is inconsistent.
- Project status page is still static, not live telemetry.
- Mojibake remains in some UI strings and docs.
- The repo is still a dirty worktree with broad pre-existing modifications.
