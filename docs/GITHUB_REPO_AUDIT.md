# GitHub Repo Audit

Generated: 2026-06-01
Audit role: GitHub Repo Auditor and Redactor Agent

## Verdict

The GitHub repo exists and is public, but the local workspace is ahead and dirty. The remote does not represent the current project state. It is not safe to present GitHub as the validated beta source.

## Remote Facts

- Repository: `tobiaspampinella/routetrust`.
- Visibility: public.
- Default branch: `main`.
- Remote URL: `https://github.com/tobiaspampinella/routetrust.git`.
- CI workflow exists at `.github/workflows/ci.yml`.

## Local/Remote Drift

- Local branch `main` is ahead of `origin/main` by 1 commit.
- Local dirty tree contains many modified and untracked files.
- Local `README.es.md` exists but remote `README.es.md` was not found on `main`.
- Remote README says beta stabilization, not production-ready, and current limits are stated. That is good.

## Repo Docs Audit

| File | Local | Remote | Verdict |
|---|---:|---:|---|
| `README.md` | yes | yes | Good caution, needs current status after audit |
| `README.es.md` | untracked local | no | Publish or remove bilingual claim |
| `SECURITY.md` | yes | yes | Good policy, but public email may be personal |
| `CONTRIBUTING.md` | yes | likely | OK |
| `ROADMAP.md` | yes | likely | Needs alignment with SaaS migration |
| `CHANGELOG.md` | yes | likely | Large local drift |
| `BETA_STABLE_CRITERIA.md` | yes | yes | Remote appears stale vs local improvements |
| `.github/workflows/ci.yml` | yes | yes | Basic CI only |

## False Claim Risks

- "Beta stable" cannot be claimed.
- "Autonomous agents" cannot be claimed.
- "Production-ready backend" cannot be claimed.
- "Bilingual repo" cannot be claimed until Spanish files are tracked/published.

## GitHub Tasks

1. Create audit branch for these docs.
2. Commit current audit reports.
3. Decide whether local dirty changes are intentional.
4. Publish bilingual files only after review.
5. Update README status with `LOCAL_DEMO_READY` only.
6. Add branch protection documentation or actual protection.
7. Add PR template requiring typecheck, lint, tests, build, smoke, security and beta-check.
