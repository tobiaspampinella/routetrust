import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeProvider, resolveMapProvider } from "./maps/provider";

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("normalizeProvider maps aliases and unknowns to mock", () => {
  assert.equal(normalizeProvider("maplibre_osm_ready"), "maplibre");
  assert.equal(normalizeProvider("google_maps_ready"), "google");
  assert.equal(normalizeProvider("local_3d_mock"), "mock");
  assert.equal(normalizeProvider("something-weird"), "mock");
  assert.equal(normalizeProvider(undefined), "mock");
});

test("mock provider is intentional, not a fallback", () => {
  withEnv({ NEXT_PUBLIC_MAP_PROVIDER: "mock" }, () => {
    const result = resolveMapProvider();
    assert.equal(result.active, "mock");
    assert.equal(result.status, "fallback");
    assert.equal(result.isFallback, false);
  });
});

test("requesting maplibre without a tile URL falls back to mock honestly", () => {
  withEnv({ NEXT_PUBLIC_MAP_PROVIDER: "maplibre", NEXT_PUBLIC_TILE_URL: undefined }, () => {
    const result = resolveMapProvider();
    assert.equal(result.requested, "maplibre");
    assert.equal(result.active, "mock");
    assert.equal(result.status, "fallback");
    assert.equal(result.isFallback, true);
    assert.match(result.reason, /NEXT_PUBLIC_TILE_URL/);
  });
});

test("a fully configured provider resolves as live", () => {
  withEnv({ NEXT_PUBLIC_MAP_PROVIDER: "maplibre", NEXT_PUBLIC_TILE_URL: "https://tiles.example/{z}/{x}/{y}.png" }, () => {
    const result = resolveMapProvider();
    assert.equal(result.active, "maplibre");
    assert.equal(result.status, "live");
    assert.equal(result.isFallback, false);
    assert.equal(result.tileUrl, "https://tiles.example/{z}/{x}/{y}.png");
  });
});
