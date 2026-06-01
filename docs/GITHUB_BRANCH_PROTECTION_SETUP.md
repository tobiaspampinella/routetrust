# GitHub Branch Protection Setup

Configure protection for `main` with these exact rules:

1. Open repository settings.
2. Go to `Branches`.
3. Add a branch protection rule for `main`.
4. Enable `Require a pull request before merging`.
5. Enable `Require approvals`.
6. Enable `Require conversation resolution before merging`.
7. Enable `Require status checks to pass before merging`.
8. Select the CI workflow checks from `.github/workflows/ci.yml`.
9. Enable `Block force pushes`.
10. Enable `Do not allow deletions`.

Recommended additional protections:

- Restrict direct pushes to maintainers only.
- Require linear history if merge strategy depends on it.
- Mirror similar but lighter protections for `develop` and `staging`.
