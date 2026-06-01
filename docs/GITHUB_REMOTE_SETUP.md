# GitHub Remote Setup

`gh` was not available on the audited machine, so remote setup must be done manually or after installing GitHub CLI.

## Suggested Repository Names

- `routetrust`
- `routetrust-operational-intelligence`

## Suggested Description

AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking, driver coordination and demo simulation.

## Manual Git Commands

Replace `<OWNER>` and `<REPO>` with the confirmed GitHub owner and repository name:

```bash
git remote add origin https://github.com/<OWNER>/<REPO>.git
git branch -M main
git push -u origin main
git push -u origin develop
git push -u origin staging
```

## If GitHub CLI Is Installed Later

Private repository:

```bash
gh repo create <OWNER>/<REPO> --private --description "AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking, driver coordination and demo simulation." --source=. --remote=origin --push
```

Public repository, only after explicit visibility confirmation:

```bash
gh repo create <OWNER>/<REPO> --public --description "AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking, driver coordination and demo simulation." --source=. --remote=origin --push
```
