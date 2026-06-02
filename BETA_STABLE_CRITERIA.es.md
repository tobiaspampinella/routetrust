# Criterios Beta Stable

[English](BETA_STABLE_CRITERIA.md) | Espanol

RouteTrust debe separar utilidad de demo local de readiness beta estable.

## Local Demo Ready

Requerido:

- `/login` carga
- `/track/demo` carga
- `/admin` es alcanzable despues de auth demo
- `npm run lint` pasa
- `npm run typecheck` pasa
- `npm test` pasa

## Beta Stable Ready

Requerido:

- `npm run build` pasa
- `npm run ux:audit` genera reportes actuales en ingles y espanol
- existe evidencia de browser smoke para las rutas criticas
- no hay mojibake visible en superficies clave
- el tracking customer se entiende en segundos
- los KPIs del business manager se leen sin adivinar
- las superficies de bugs y project status no exageran el readiness real
- los docs publicos son bilingues y consistentes
- los docs publicos de seguridad siguen redactados

## No Alcanza

- reportes generados sin verificacion
- actividad del scheduler
- docs de agentes por si solos
- datos demo locales por si solos

## Regla de Verdad Stable

No etiquetar el producto como estable cuando QA, UX, docs y evidencia de runtime no coinciden.
