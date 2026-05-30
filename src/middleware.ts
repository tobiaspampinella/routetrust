import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/sessionToken";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  if (pathname.startsWith("/admin")) {
    if (user?.role === "admin") return NextResponse.next();
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/driver")) {
    if (user?.role === "driver") return NextResponse.next();
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const nextPath = request.nextUrl.searchParams.get("next");
    if (nextPath?.startsWith("/admin") && user.role === "admin") {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
    if (nextPath?.startsWith("/driver") && user.role === "driver") {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
    return NextResponse.redirect(new URL(user.role === "admin" ? "/admin" : "/driver", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/login"],
};
