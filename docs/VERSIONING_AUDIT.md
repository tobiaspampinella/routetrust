# Versioning Audit

Generated: 2026-06-01

## Verdict

Version display exists and currently reports `v0.15`. Versioning is not release-grade because the Git tree is dirty and local docs/code have large unpublished drift.

## Evidence

- `src/lib/version.ts` exists.
- `VersionFooter` exists.
- Runtime project status expects and sees `v0.15`.
- `CHANGELOG.md` exists.
- `SOFTWARE_LOG.md` exists.

## Gaps

- No immutable release tag.
- No clean Git baseline.
- No staging release URL.
- No release artifact.
- No separation between local runtime report and public changelog.

## Required Version Rules

- Version bump only after clean CI and smoke.
- Release notes must list validation commands.
- Public changelog must avoid claiming SaaS readiness.
- Runtime-generated reports must not become release truth without review.
