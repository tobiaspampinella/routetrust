# Map Provider Decision

## Decision

Use MapLibre as the renderer and keep Google Maps out of the critical path for beta readiness.

## Reason

- Google-backed build/runtime dependencies are unnecessary for the current beta.
- The app must not fail when no premium map token exists.
- A logistics SaaS beta needs a legal and operationally predictable fallback.

## Beta target

- Renderer: MapLibre GL JS
- Tiles: OSM-compatible provider configured by env
- Routing: OSRM or OpenRouteService when available
- Fallback: static route/GeoJSON for demo continuity

## Constraints

- Do not use `tile.openstreetmap.org` as an abused production dependency.
- Always expose attribution.
- Keep provider selection behind environment variables.

## Current status

PARTIAL_IMPLEMENTED. Direction exists; provider abstraction and real route backend are still incomplete.
