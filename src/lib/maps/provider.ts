/**
 * Map provider resolution with safe fallback.
 *
 * RouteTrust never hard-depends on a paid maps API. A provider is requested via
 * NEXT_PUBLIC_MAP_PROVIDER; if its required configuration is missing we fall back to the local
 * `mock` visual provider and report that honestly (no fake "live map" claims). This module is the
 * single source of truth for which provider is active, consumed by /api/health and the UI.
 */

export type MapProvider = "mock" | "maplibre" | "osrm" | "openrouteservice" | "google" | "apple";
export type MapStatus = "live" | "fallback";

export interface ResolvedMapProvider {
  /** Provider requested via env (normalized). */
  requested: MapProvider;
  /** Provider actually in use after fallback. */
  active: MapProvider;
  /** "live" when a real external provider is fully configured; "fallback" when using the mock. */
  status: MapStatus;
  /** True when a real provider was requested but its config was missing, so we fell back to mock. */
  isFallback: boolean;
  /** Tile URL for raster/vector providers, when configured. */
  tileUrl?: string;
  /** Human-readable explanation of the resolution. */
  reason: string;
}

const PROVIDER_ALIASES: Record<string, MapProvider> = {
  mock: "mock",
  local_3d_mock: "mock",
  none: "mock",
  maplibre: "maplibre",
  maplibre_osm_ready: "maplibre",
  osm: "maplibre",
  osrm: "osrm",
  openrouteservice: "openrouteservice",
  openroute: "openrouteservice",
  google: "google",
  google_maps_ready: "google",
  apple: "apple",
  apple_mapkit_ready: "apple",
};

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function normalizeProvider(raw?: string): MapProvider {
  return PROVIDER_ALIASES[(raw || "").trim().toLowerCase()] ?? "mock";
}

interface ProviderConfig {
  ok: boolean;
  tileUrl?: string;
  missing?: string;
}

function providerConfig(provider: MapProvider): ProviderConfig {
  switch (provider) {
    case "mock":
      return { ok: true };
    case "maplibre": {
      const tileUrl = readEnv("NEXT_PUBLIC_TILE_URL");
      return tileUrl ? { ok: true, tileUrl } : { ok: false, missing: "NEXT_PUBLIC_TILE_URL" };
    }
    case "osrm": {
      const base = readEnv("OSRM_BASE_URL");
      return base ? { ok: true } : { ok: false, missing: "OSRM_BASE_URL" };
    }
    case "openrouteservice": {
      const key = readEnv("OPENROUTE_API_KEY") ?? readEnv("NEXT_PUBLIC_OPENROUTE_API_KEY");
      return key ? { ok: true } : { ok: false, missing: "OPENROUTE_API_KEY" };
    }
    case "google": {
      const key = readEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      return key ? { ok: true } : { ok: false, missing: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" };
    }
    case "apple": {
      const token = readEnv("NEXT_PUBLIC_APPLE_MAPKIT_TOKEN");
      return token ? { ok: true } : { ok: false, missing: "NEXT_PUBLIC_APPLE_MAPKIT_TOKEN" };
    }
    default:
      return { ok: false, missing: "unknown provider" };
  }
}

export function resolveMapProvider(): ResolvedMapProvider {
  const requested = normalizeProvider(readEnv("NEXT_PUBLIC_MAP_PROVIDER"));

  if (requested === "mock") {
    return {
      requested,
      active: "mock",
      status: "fallback",
      isFallback: false,
      reason: "Mock provider selected; no external map service required.",
    };
  }

  const config = providerConfig(requested);
  if (config.ok) {
    return {
      requested,
      active: requested,
      status: "live",
      isFallback: false,
      tileUrl: config.tileUrl,
      reason: `${requested} is configured and active.`,
    };
  }

  return {
    requested,
    active: "mock",
    status: "fallback",
    isFallback: true,
    reason: `${requested} unavailable (missing ${config.missing}); using local mock fallback.`,
  };
}
