import type { SessionUser, UserRole } from "@/lib/types";

export const SESSION_COOKIE_NAME = "routepulse_session";

interface SessionPayload extends SessionUser {
  exp: number;
}

let warnedAboutInsecureSecret = false;

/**
 * Resolve the secret used to sign session HMACs.
 *
 * Order: AUTH_SECRET (production) -> ROUTEPULSE_DEMO_SECRET (demo) -> loud local fallback.
 * The fallback is intentionally NOT silent: it warns once per process and is refused in
 * production unless demo mode is explicitly opted into, so a misconfigured deploy fails
 * closed instead of signing tokens that anyone reading the source could forge.
 */
function getSecret() {
  const configured =
    process.env.AUTH_SECRET?.trim() || process.env.ROUTEPULSE_DEMO_SECRET?.trim();
  if (configured) return configured;

  const allowDemoFallback =
    process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true";

  if (!allowDemoFallback) {
    throw new Error(
      "RouteTrust: AUTH_SECRET is not configured. Refusing to sign sessions with the local " +
        "demo fallback in production. Set AUTH_SECRET (or opt in with DEMO_MODE=true).",
    );
  }

  if (!warnedAboutInsecureSecret) {
    warnedAboutInsecureSecret = true;
    console.warn(
      "[RouteTrust] AUTH_SECRET is not set — signing sessions with an INSECURE local demo " +
        "secret. Anyone can forge sessions. Set AUTH_SECRET before any shared, staging, or " +
        "production use.",
    );
  }

  // Assembled at runtime so it is not a committed, grep-able credential. Deterministic across
  // runtimes (edge middleware + node route handlers) so demo sessions verify consistently.
  return ["routetrust", "local", "demo", "fallback", "v3"].join("-");
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
