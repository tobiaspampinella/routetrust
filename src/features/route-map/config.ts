import type { MapTileConfig } from "./types";

function cleanEnv(value?: string) {
  return value && value.trim() ? value.trim() : undefined;
}

function readNumberValue(value: string | undefined, fallback: number) {
  const parsed = Number(cleanEnv(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readPublicMapEnv() {
  return {
    tileUrl: cleanEnv(process.env.NEXT_PUBLIC_MAP_TILE_URL) ?? cleanEnv(process.env.NEXT_PUBLIC_TILE_URL),
    attribution: cleanEnv(process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION),
    defaultLat: readNumberValue(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT, -34.6037),
    defaultLng: readNumberValue(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG, -58.3816),
    defaultZoom: readNumberValue(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM, 12),
  };
}

export function getMapTileConfig(): MapTileConfig {
  const env = readPublicMapEnv();

  return {
    tileUrl: env.tileUrl,
    attribution: env.attribution,
    defaultCenter: {
      lat: env.defaultLat,
      lng: env.defaultLng,
    },
    defaultZoom: env.defaultZoom,
    hasTileProvider: Boolean(env.tileUrl),
  };
}
