import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ticket-hub-token";

/**
 * Shallow gate: only checks that the cookie is present, never verifies
 * its signature/expiry here - that's the backend's job on every real
 * request (via JwtAuthGuard). This just stops an obviously logged-out
 * browser from ever rendering /home; an expired-but-present token still
 * gets past this and fails later at the API call, same as before.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(COOKIE_NAME);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*"],
};
