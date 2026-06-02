import type { SessionUser, UserRole } from "@/lib/types";

export const SESSION_COOKIE_NAME = "routepulse_session";

interface SessionPayload extends SessionUser {
  exp: number;
}

function getSecret() {
  const configuredSecret = process.env.ROUTEPULSE_DEMO_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ROUTEPULSE_DEMO_SECRET or AUTH_SECRET is required in production.");
  }

  return [
    "routetrust-supervised-demo",
    process.env.APP_URL || "",
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.NODE_ENV || "development",
    SESSION_COOKIE_NAME,
  ].join("|");
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

async function hmacSha256(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(user: SessionUser, ttlSeconds = 60 * 60 * 8) {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = await hmacSha256(encodedPayload);
  if (expected !== signature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "admin" && payload.role !== "driver") return null;

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role as UserRole,
      name: payload.name,
      driverId: payload.driverId,
      assignedRouteId: payload.assignedRouteId,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
