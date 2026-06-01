# GitHub Safe Publish Report

Date: 2026-06-01
Branch: `main`
Origin: `https://github.com/tobiaspampinella/routetrust.git`

## Files Reviewed

- `README.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `.gitignore`
- `.env.example`
- `docs/`
- `.github/`
- `scripts/`
- `src/`
- `package.json`

## Secrets Found

- No committed real tokens, API keys, private keys or database URLs were detected in the reviewed publication surface.
- Public-safe review still found fixed demo identities in source and test fixtures. Those details remain under review and are not approved for publication as stable-access guidance.

## Secrets Removed

- Removed fixed secret fallback from session token signing logic.
- Kept example environment variables empty and non-deployable.
- Redacted local machine path references and workstation-specific diagnostics from public QA and stabilization docs.

## Documents Redacted

- `docs/CMS_AUDIT.md`
- `docs/DEV_SERVER_STATUS.md`
- `docs/ENVIRONMENT_SETUP.md`
- `docs/INSTALLATION_REPORT.md`
- `docs/PLAYWRIGHT_RUNTIME_REPORT.md`
- `docs/RESTORE_REPORT.md`
- `docs/DEMO_LOCAL_ONLY.md`
- `docs/GITHUB_PREP_REPORT.md`
- `docs/GITHUB_PUBLICATION_REPORT.md`
- `docs/ISSUES.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/QA.md`
- `docs/STABILIZATION_REPORT.md`

## Files Excluded From Publication

- `data/runtime/bug-dispatches.json`
- `data/runtime/bug-reports.json`
- `runtime/heartbeats/`
- `runtime/logs/`
- `runtime/project-status.json`
- `docs/agent-logs/`
- `docs/private/`
- `agents/*/status.md`
- `agents/*/output.md`

## Final State

`BLOCKED`

Reason summary:

- Public-safe redaction and runtime exclusion are partially complete.
- Fixed demo identities still exist in source and Playwright smoke fixtures.
- Additional operational reports and agent/runtime artifacts remain in the worktree and must stay out of any public commit until they are fully excluded or rewritten.
