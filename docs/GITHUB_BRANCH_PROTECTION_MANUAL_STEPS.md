# GitHub Branch Protection Manual Steps

Status: manual required

`gh` was not available on the publication machine, so branch protection could not be automated.

## Protect `main`

1. Open GitHub repository settings.
2. Go to `Branches`.
3. Add a protection rule for `main`.
4. Enable `Require a pull request before merging`.
5. Enable required approvals.
6. Enable `Require conversation resolution before merging`.
7. Enable `Require status checks to pass before merging`.
8. Select the CI workflow checks from `.github/workflows/ci.yml`.
9. Disable force pushes.
10. Disable branch deletion.

## Recommended Secondary Rules

- Apply lighter protection to `develop`.
- Apply lighter protection to `staging`.
- Keep `stabilization/*`, `feature/*`, `fix/*` and `agent/*` unprotected unless governance changes.

## Verification

Record the final enabled rules in `docs/GITHUB_PUBLICATION_REPORT.md` after the remote repository exists.
