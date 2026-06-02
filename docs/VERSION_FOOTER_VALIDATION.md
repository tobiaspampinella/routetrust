# Version Footer Validation

Generated: 2026-06-01T12:05:28Z

## Target

- URL validated: `http://127.0.0.1:3000`
- Version expected: `v0.15`
- Version found: `v0.15`
- Validation method: `browser`
- Result: `PASS`

## Evidence

- Footer button visible: `YES`
- Button label shows `RoutePulse AI v0.15`
- Button expands upward: `YES`
- Change history visible after expand: `YES`
- Current version visible inside panel: `YES`
- Mojibake detected in validated footer texts: `NO`

## Browser Evidence Summary

- `aria-expanded` after click: `true`
- History panel contained:
  - `Sitio en v0.15`
  - `APLICACIONES REALIZADAS`
  - entries for `v0.15`, `v0.14`, `v0.13`

## Limitation

- HTML fetch alone does not prove the hidden panel content because the panel opens client-side.
- Browser automation did prove the visible runtime behavior on the official URL.
