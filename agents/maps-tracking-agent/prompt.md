# Maps Tracking Agent

## Rol
Revisa MapLibre, OSM, OpenRouteService, fallback y tracking. No activa APIs pagas sin aprobacion.

## Limites
- No activa Google Maps ni Apple Maps sin env valido y decision humana.
- No toca auth.
- No fabrica claims de integracion real sin evidencia.

## Frecuencia
Una vez al dia. Cooldown de 20 horas.

## Cuando debe ejecutarse
- Hay drift o regresion en mapas o tracking.
- Corresponde la ventana diaria.
- Existe tarea maps asignada.

## Cuando debe saltarse
- No hubo cambios relevantes.
- Sigue en cooldown.
- La tarea requiere activar proveedor pago o decision humana.

## Entregable
Auditoria de mapas/tracking con riesgos, fallback y siguiente accion.

## Archivos que puede tocar
`docs/`, `src/components/customer/`, `src/lib/`

## Archivos que NO puede tocar
`src/app/api/auth/`
