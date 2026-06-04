import assert from "node:assert/strict";
import test from "node:test";

import { mapDbDriverToDomain, mapDomainDriverToDb, normalizeDriverStatus } from "../services/cms/driverDbMapping";

test("mapDbDriverToDomain derives assigned route and normalizes status", () => {
  const driver = mapDbDriverToDomain({
    id: "driver-001",
    name: "Miguel Alvarez",
    phone: "+52 55 0101 2020",
    status: "on_route",
    routes: [{ id: "route-001" }],
  });

  assert.deepEqual(driver, {
    id: "driver-001",
    name: "Miguel Alvarez",
    phone: "+52 55 0101 2020",
    status: "on_route",
    assignedRouteId: "route-001",
  });
});

test("driver DB mapping rejects unknown statuses without leaking invalid UI state", () => {
  assert.equal(normalizeDriverStatus("suspended"), "available");
  assert.deepEqual(
    mapDomainDriverToDb(
      {
        id: "driver-002",
        name: "Laura Jimenez",
        phone: "",
        status: "paused",
        assignedRouteId: "",
      },
      "tenant-demo-latam",
    ),
    {
      id: "driver-002",
      tenantId: "tenant-demo-latam",
      name: "Laura Jimenez",
      phone: null,
      status: "paused",
    },
  );
});
