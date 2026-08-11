import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ticket-hub-token";

/**
 * No backend call needed: sessions are stateless JWTs, nothing to
 * invalidate server-side. Logging out is just deleting the cookie that
 * carries the token - the same way it was set in app/api/login/route.ts.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
