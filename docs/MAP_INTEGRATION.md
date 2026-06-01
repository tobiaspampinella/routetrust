# Map Integration

Fecha: 2026-05-31
Estado: auditoria FASE 4.

## Estado actual

Existe:

- Fallback local visual en `FleetTrackingMap`.
- Mapa estilo 3D local en `CustomerTrackingMap3D`.
- `DriverMap` reutiliza `CustomerTrackingMap3D`.
- Coordenadas demo en `demoMapCoordinates.ts`.
- Google Maps provider-ready en `FleetTrackingMap`.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` en `.env.example`.
- `MapProviderMode` con:
  - `local_3d_mock`
  - `maplibre_osm_ready`
  - `google_maps_ready`
  - `apple_mapkit_ready`

## Google Maps

Implementado parcialmente:

- Carga dinamica de Google Maps JS API si existe `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- DirectionsService.
- DirectionsRenderer.
- TrafficLayer.
- Marker de camion.
- Markers de paradas.

Riesgos:

- Requiere billing/key valida.
- No hay test automatizado para fallback cuando falla el script.
- No hay `NEXT_PUBLIC_GOOGLE_MAP_ID` usado por el codigo actual.

## MapLibre

Estado real:

- Declarado como modo `maplibre_osm_ready`.
- Declarado en docs/topics.
- No esta instalado en `package.json`.
- No hay componente MapLibre.
- No hay tile provider ni routing provider.

Conclusion: MapLibre no esta implementado.

## Apple MapKit

Estado real:

- Declarado como modo `apple_mapkit_ready`.
- No hay integracion.

Conclusion: Apple MapKit no esta implementado.

## Fallback local

Estado:

- Funciona sin secrets.
- Es la unica garantia para demo offline/local.
- Debe permanecer como provider default de seguridad aunque Google/MapLibre existan.

## Que falta

- Provider adapter interface.
- Tests visuales o smoke para fallback.
- Manejo explicito de errores de Google script.
- MapLibre real si se aprueba dependencia.
- Politica legal/billing de tiles.
- Separacion entre route simulation y map rendering.

## Que NO debe tocarse

- No eliminar fallback local.
- No hacer que `/track/demo` dependa de Google.
- No instalar MapLibre sin autorizacion de fase.
- No usar tiles sin revisar terminos.
- No exponer API keys privadas.

## Orden de implementacion

1. Definir `MapProviderAdapter`.
2. Mantener fallback local como baseline.
3. Agregar tests de fallback sin API key.
4. Hardening de Google provider.
5. Evaluar MapLibre/OSM legal y tecnico.
6. Implementar MapLibre solo si se autoriza.
7. Conectar trafico/routing real detras de adapter.
