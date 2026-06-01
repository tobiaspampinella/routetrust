import { NextResponse } from "next/server";
import { authenticateTestUser } from "@/lib/serverAuth";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function shouldUseSecureCookie(request: Request) {
  const hostname = new URL(request.url).hostname;
  return process.env.NODE_ENV === "production" && hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email y password son requeridos." }, { status: 400 });
  }

  const user = await authenticateTestUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Credenciales invalidas." }, { status: 401 });
  }

  const token = await createSessionToken(user);
  const response = NextResponse.json({ user });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
