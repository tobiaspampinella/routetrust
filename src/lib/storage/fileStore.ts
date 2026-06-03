import "server-only";

import { access, copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const RUNTIME_DATA_DIR = path.join(process.cwd(), "data", "runtime");

export function runtimeDataPath(...segments: string[]) {
  return path.join(RUNTIME_DATA_DIR, ...segments);
}

async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function ensureFile<T>(filePath: string, initialValue: T) {
  await ensureParentDir(filePath);

  try {
    await access(filePath);
    return filePath;
  } catch {
    await writeFile(filePath, `${JSON.stringify(initialValue, null, 2)}\n`, "utf8");
    return filePath;
  }
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);

  try {
    const raw = await readFile(filePath, "utf8");
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function writeJsonAtomic(filePath: string, value: unknown, options?: { backupBeforeWrite?: boolean }) {
  await ensureParentDir(filePath);

  const payload = `${JSON.stringify(value, null, 2)}\n`;
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  if (options?.backupBeforeWrite) {
    try {
      await copyFile(filePath, `${filePath}.bak`);
    } catch {
      // Ignore backup failures when the source file does not exist yet.
    }
  }

  await writeFile(tempPath, payload, "utf8");

  try {
    await rename(tempPath, filePath);
  } catch {
    await writeFile(filePath, payload, "utf8");
    await rm(tempPath, { force: true });
  }

  return filePath;
}

export async function appendRecord<T>(
  filePath: string,
  record: T,
  options?: {
    collectionKey?: string;
    maxEntries?: number;
    backupBeforeWrite?: boolean;
  },
) {
  const collectionKey = options?.collectionKey ?? "records";
  const maxEntries = options?.maxEntries ?? 500;
  const state = await readJson<Record<string, unknown>>(filePath, { [collectionKey]: [] });
  const current = Array.isArray(state[collectionKey]) ? (state[collectionKey] as T[]) : [];
  const next = {
    ...state,
    [collectionKey]: [record, ...current].slice(0, maxEntries),
  };
  await writeJsonAtomic(filePath, next, { backupBeforeWrite: options?.backupBeforeWrite });
  return next;
}
