import "server-only";

import type { Driver } from "@/lib/types";
import { initialRoutePulseData } from "@/data/mockData";
import { readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";

interface StoredDriversState {
  drivers: Driver[];
}

const DRIVERS_FILE = runtimeDataPath("cms-drivers.json");

/**
 * Persistence source for the drivers CMS module.
 *
 * There is no Prisma model for drivers yet, so this uses the atomic file store as the honest
 * fallback (the same pattern as the bug store). `source` is reported to the client so the UI
 * can show whether it is database- or file-backed — no fake "production DB" claims.
 */
export type DriversSource = "db" | "file";

export async function listDrivers(): Promise<{ drivers: Driver[]; source: DriversSource }> {
  const state = await readJson<StoredDriversState>(DRIVERS_FILE, { drivers: initialRoutePulseData.drivers });
  const drivers = Array.isArray(state.drivers) ? state.drivers : [];
  return { drivers, source: "file" };
}

export async function saveDriver(driver: Driver): Promise<Driver[]> {
  const { drivers } = await listDrivers();
  const exists = drivers.some((item) => item.id === driver.id);
  const next = exists ? drivers.map((item) => (item.id === driver.id ? driver : item)) : [...drivers, driver];
  await writeJsonAtomic(DRIVERS_FILE, { drivers: next }, { backupBeforeWrite: true });
  return next;
}

export async function deleteDriver(driverId: string): Promise<Driver[]> {
  const { drivers } = await listDrivers();
  const next = drivers.filter((item) => item.id !== driverId);
  await writeJsonAtomic(DRIVERS_FILE, { drivers: next }, { backupBeforeWrite: true });
  return next;
}

export async function findDriver(driverId: string): Promise<Driver | undefined> {
  const { drivers } = await listDrivers();
  return drivers.find((item) => item.id === driverId);
}
