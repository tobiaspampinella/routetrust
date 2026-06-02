# Local Model Strategy

Generated: 2026-06-01
Audit role: Local Model Delegation Agent

## Verdict

Local models can reduce cost for summaries, doc review and checklist triage. They must not make architecture, security or production-readiness decisions.

## Good Local Model Tasks

- summarize command logs
- classify bug reports by module/severity draft
- compare docs for stale claims
- draft changelog entries
- review Spanish/English consistency
- extract TODOs from docs
- produce first-pass UX checklist
- group agent reports

## Not For Local Model

- security signoff
- auth design
- tenant isolation
- database migration design
- deploy diagnosis
- production incident response
- final beta-stable verdict
- backend refactor decisions
- financial pricing decisions without human review

## Agent Mapping

| Agent | Local model allowed | Escalate to GPT-5.5/Codex when |
|---|---:|---|
| Docs Agent | yes | release claims or security content |
| UX Research Agent | yes | product decision affects roadmap |
| Bug Triage Agent | yes | P0/P1/security |
| Local Website Assistant | yes | asks for code/security/deploy |
| QA Agent | partial | flaky tests or regression root cause |
| Backend Agent | no for decisions | any backend implementation |
| CISO Agent | no for signoff | always for security verdict |
| DevOps Agent | no for deploy fixes | staging/prod issue |
| CTO Agent | no | architecture decisions |

## Frequency

- Daily local summary is acceptable.
- Heavy repo audits should run only after meaningful diffs.
- Security and beta verdicts require Codex/GPT-class review.
