import { NextResponse } from "next/server";
import { getMapTileConfig } from "@/features/route-map/config";
import { getRouteMapSnapshot } from "@/features/route-map/server/store";
import { resolveMapProvider } from "@/lib/maps/provider";

export async function GET() {
  const [snapshot, mapProvider] = await Promise.all([getRouteMapSnapshot(), Promise.resolve(resolveMapProvider())]);
  const tileConfig = getMapTileConfig();

  return NextResponse.json({
    status: "ok",
    module: "route-map-system",
    timestamp: new Date().toISOString(),
    provider: {
      requested: mapProvider.requested,
      active: mapProvider.active,
      status: tileConfig.hasTileProvider ? "configured" : "fallback",
      reason: tileConfig.hasTileProvider ? "Tile URL configured through env." : "No tile URL configured; Leaflet fallback surface is active.",
    },
    checks: {
      points: snapshot.points.length,
      routes: snapshot.routes.length,
      tileProvider: tileConfig.hasTileProvider ? "configured" : "missing",
      attribution: tileConfig.attribution ? "configured" : "missing",
    },
  });
}
