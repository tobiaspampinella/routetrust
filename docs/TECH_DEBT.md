# FASE 1 - Technical Debt

Fecha: 2026-05-31

## Bloqueos tecnicos detectados

1. No existe script `test`.
   - Impacto: no hay validacion automatizada de flujos beta.
   - Fix minimo: agregar test runner y script `test` en fase QA autorizada.

2. npm allow-scripts pendiente.
   - Impacto: paquetes con install hooks requieren revision explicita.
   - Paquetes: `@prisma/client`, `@prisma/engines`, `esbuild`, `prisma`, `sharp`, `unrs-resolver`.
   - Fix minimo: revisar y aprobar scripts con politica definida antes de produccion.

3. Next.js 15.1.3 tiene warning de seguridad ya detectado.
   - Impacto: riesgo antes de publicar.
   - Fix minimo: upgrade controlado de Next.js en fase de dependency hardening.

4. Docker no esta disponible localmente.
   - Impacto: no se puede validar Postgres/Redis con `docker-compose.yml`.
   - Fix minimo: instalar Docker Desktop o usar servicios locales equivalentes.

5. Node global en PATH no es usable.
   - Impacto: comandos npm fallan si no se usa wrapper.
   - Fix minimo: instalar Node LTS normal o mantener wrapper documentado.

## No abordado en FASE 1

- No se agregaron features.
- No se hizo refactor.
- No se agregaron tests.
- No se cambio arquitectura.

## 2026-06-01 - Stabilization debt still open

1. `tsconfig.typecheck.json` exists as a safety rail because base `tsconfig.json` had been allowed to drift toward generated-artifact coupling.
   - Impacto: future edits can silently reintroduce `.next` fragility if config discipline is lost.
   - Fix minimo: keep generated folders out of base TypeScript includes.

2. `npm run beta-check` is failing for governance/runtime reasons unrelated to the app runtime.
   - Impacto: release automation still reports failure even though runtime/build/typecheck are healthy.
   - Fix minimo: reconcile missing docs and lock/watchdog metadata.

3. Project status UI is static.
   - Impacto: operators can read a healthy-looking status page that is not real telemetry.
   - Fix minimo: either wire it to live checks or label it explicitly as static documentation.

4. Mojibake remains in UI strings.
   - Impacto: visible quality regression in customer/admin surfaces.
   - Fix minimo: normalize file encoding and replace corrupted literals.
