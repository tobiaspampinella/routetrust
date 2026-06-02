# Runtime Drift Policy

## Local Rule

- Only port `3000` is the official local RouteTrust runtime.
- Port `3001` is allowed only for temporary validation or isolated debugging.
- A secondary port must be shut down after the check ends.

## Reporting Rule

- `runtime/project-status.json` must point to `http://127.0.0.1:3000` as the official local URL.
- `beta-check` must validate against the official local URL.
- Do not report `BETA_STABLE_READY` from a secondary runtime.
- Do not report runtime alignment when the official process cannot be cleanly identified or restarted.

## Drift Signals

- More than one RouteTrust process listening locally
- Any RouteTrust listener on `3001` after validation ends
- A process on `3000` that cannot be tied back to a known RouteTrust command line
- Visible site version differs from expected source version

## Required Response

1. Identify listener PIDs on `3000` and `3001`.
2. Stop only the confirmed RouteTrust stale processes.
3. Keep a single official local runtime on `3000`.
4. Re-run `npm run runtime:status`.
5. Re-run `npm run beta-check`.
6. Re-run browser validation for the version footer when the visible site changed.
