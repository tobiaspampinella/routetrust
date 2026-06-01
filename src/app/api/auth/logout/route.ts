import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function shouldUseSecureCookie(request: Request) {
  const hostname = new URL(request.url).hostname;
  return process.env.NODE_ENV === "production" && hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
}

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 0,
  });

  return response;
}
