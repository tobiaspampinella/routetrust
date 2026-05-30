# Locked Files

Last updated: 2026-05-30

## Active Lock

None.

## Rules

- No agent touches a locked file without updating this file first.
- No agent modifies architecture core without a CURRENT_DECISIONS entry.
- No agent runs a global refactor during restore.
- Locks must be released or handed off at the end of each cycle.
