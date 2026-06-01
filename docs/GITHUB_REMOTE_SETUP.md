# GitHub Remote Setup

`gh` was not available on the audited machine, so remote setup must be done manually or after installing GitHub CLI.

## Confirmed Working Assumption

- Preferred owner: `tobiaspampinella`
- Preferred repository: `routetrust`
- Alternate repository: `routetrust-operational-intelligence`

## Suggested Description

AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking, driver coordination and demo simulation.

## Manual Git Commands

```bash
git remote add origin https://github.com/tobiaspampinella/routetrust.git
git push -u origin main
git push -u origin develop
git push -u origin staging
git push -u origin stabilization/beta-saas-v0.1
```

If the primary repository name is unavailable, use:

```bash
git remote add origin https://github.com/tobiaspampinella/routetrust-operational-intelligence.git
git push -u origin main
git push -u origin develop
git push -u origin staging
git push -u origin stabilization/beta-saas-v0.1
```

## If GitHub CLI Is Installed Later

Check installation and authentication:

```bash
gh --version
gh auth status
gh api user --jq .login
```

Private repository:

```bash
gh repo create routetrust --private --description "AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking and driver coordination." --source=. --remote=origin --push
```

If `routetrust` already exists:

```bash
gh repo create routetrust-operational-intelligence --private --description "AI-built, human-orchestrated SaaS B2B platform for logistics operational intelligence, supervised route automation, tracking and driver coordination." --source=. --remote=origin --push
```

Public repository, only after explicit visibility confirmation:

```bash
gh repo edit --visibility public
```
