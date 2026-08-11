import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
const COOKIE_MAX_AGE_SECONDS = 3600;
const GENERIC_ERROR_BODY = { message: "Invalid credentials" } as const;

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

type BackendLoginResponse = {
  access_token: string;
};

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(GENERIC_ERROR_BODY, { status: 400 });
  }

  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(GENERIC_ERROR_BODY, { status: 400 });
  }

  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "Login is not available right now." },
      { status: 500 },
    );
  }

  const apiResponse = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!apiResponse.ok) {
    // Never distinguish "unknown user" from "wrong password" here either;
    // ticket-hub-api already returns a generic 401 for both cases.
    return NextResponse.json(GENERIC_ERROR_BODY, { status: 401 });
  }

  const { access_token: accessToken } =
    (await apiResponse.json()) as BackendLoginResponse;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.TICKET_HUB_COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  // The token never reaches client JS: only an opaque success flag is returned.
  return NextResponse.json({ ok: true });
}
