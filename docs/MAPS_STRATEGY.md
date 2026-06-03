# Maps Strategy

RouteTrust never hard-depends on a paid maps API. Maps degrade safely to a local mock visual
so the product runs with zero external configuration, and the active provider is reported
honestly through `/api/health` (`checks.maps`, `mapProvider`, `details.maps`).

Single source of truth: `src/lib/maps/provider.ts` → `resolveMapProvider()`.

## Providers

| Provider           | Requires                              | Notes |
|--------------------|---------------------------------------|-------|
| `mock`             | nothing                               | Local 3D/SVG visual. Default and safe fallback. |
| `maplibre`         | `NEXT_PUBLIC_TILE_URL`                | Vector/raster tiles. Bring your own tile URL. |
| `osrm`             | `OSRM_BASE_URL`                       | Routing only (self-hosted recommended). |
| `openrouteservice` | `OPENROUTE_API_KEY`                   | Routing/directions. |
| `google`           | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`     | Optional; not required to operate. |
| `apple`            | `NEXT_PUBLIC_APPLE_MAPKIT_TOKEN`      | Optional; not required to operate. |

## Resolution & fallback

1. Read `NEXT_PUBLIC_MAP_PROVIDER` (aliases like `maplibre_osm_ready` are normalized).
2. If `mock` is selected → `status: "fallback"`, `isFallback: false` (intentional, not an error).
3. If a real provider is selected and its required config is present → `status: "live"`.
4. If a real provider is selected but its config is missing → **fall back to `mock`**,
   `status: "fallback"`, `isFallback: true`, with a `reason` naming the missing variable.

`/api/health` exposes `checks.maps` (`live` | `fallback`), `mapProvider` (active provider) and
`details.maps` (the reason). The admin dashboard status strip renders this honestly.

## Environment variables

```
NEXT_PUBLIC_MAP_PROVIDER=maplibre        # mock | maplibre | osrm | openrouteservice | google | apple
NEXT_PUBLIC_TILE_URL=                     # required for maplibre
OSRM_BASE_URL=                            # required for osrm
OPENROUTE_API_KEY=                        # required for openrouteservice
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=          # optional (google)
NEXT_PUBLIC_APPLE_MAPKIT_TOKEN=           # optional (apple)
```

## Limits & guardrails

- Do **not** abuse public OSM demo tiles in production — configure your own `NEXT_PUBLIC_TILE_URL`
  (self-hosted or a tile provider with an appropriate plan).
- No Google/Apple dependency to operate: missing keys degrade to mock, never crash.
- Routing providers (osrm/openrouteservice) are optional; the demo simulation does not require them.
- The mock provider is presentation-only — it does not compute real-world routes or ETAs from
  live traffic; ETA/risk come from the in-app predictive engine.
