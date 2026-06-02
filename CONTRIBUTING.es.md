# Contribucion

RouteTrust se desarrolla como un producto logistico construido con IA y orquestado por humanos.

## Reglas de Trabajo

- Mantener el alcance explicito.
- No afirmar readiness productivo sin evidencia.
- No agregar features que salten aprobacion humana o limites de seguridad.
- No publicar secretos, rutas locales, credenciales personales ni detalles explotables.

## Modelo de Ramas

- `main`: solo builds estables aprobados
- `develop`: trabajo de integracion
- `staging`: validacion de release
- `stabilization/*`: recuperacion y hardening
- `agent/*`: ejecucion aislada por agente
- `feature/*`: trabajo funcional acotado
- `fix/*`: correcciones acotadas

Los pushes directos a `main` no forman parte del flujo normal.

## Antes de Editar

1. Leer `docs/ACTIVE_TASKS.md`.
2. Leer `docs/NEXT_AGENT_PROMPT.md`.
3. Confirmar que los archivos objetivo no queden bloqueados por otra tarea activa.
4. Mantener cambios incrementales y verificables.

## Checks Requeridos

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Si el cambio toca UX, ejecutar tambien:

```bash
npm run ux:audit
```

Si el cambio toca flujos visibles y Playwright esta disponible, ejecutar tambien:

```bash
npm run qa:smoke
```

## Obligaciones de Documentacion

Los cambios relevantes deben actualizar:

- `CHANGELOG.md`
- `docs/NEXT_AGENT_PROMPT.md`
- `docs/ACTIVE_TASKS.md` cuando cambien ownership o siguientes pasos
- docs relevantes bajo `docs/design` o `docs/product` cuando cambie comportamiento o UX

## Capa de Aprobacion Humana

Los humanos aprueban:

- releases
- claims de produccion
- cambios sensibles de seguridad
- cambios de tenant o permisos
- integraciones externas
- cambios de prioridad del roadmap

## Estandar de Idioma

La documentacion publica critica para producto o contribucion debe existir en ingles y espanol.
