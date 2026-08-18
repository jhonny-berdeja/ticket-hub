import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
const COOKIE_MAX_AGE_SECONDS = 3600;
const REQUEST_TIMEOUT_MS = 10_000;

const BAD_REQUEST_STATUS = { status: 400 } as const;
const UNAUTHORIZED_STATUS = { status: 401 } as const;
const SERVICE_UNAVAILABLE_STATUS = { status: 500 } as const;

const GENERIC_ERROR_MESSAGE = { message: "Invalid credentials" } as const;
const API_URL_MISSING_MESSAGE = {
  message: "Login is not available right now.",
} as const;
const APPLICATION_NAME_MISSING_MESSAGE = {
  message: "Login is not available right now.",
} as const;
const BACKEND_UNREACHABLE_MESSAGE = {
  message: "Could not reach the login service. Please try again.",
} as const;
const BACKEND_ERROR_MESSAGE = {
  message: "The login service is having trouble right now. Please try again.",
} as const;

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

type BackendLoginResponse = {
  access_token: string;
};

/**
 * Authenticates against auth-api now, not this app's own (removed)
 * backend login -- see ticket-hub-api's history. Same
 * internal-users/login + X-Application-Name pattern as iam's own
 * app/api/login/route.ts.
 */
export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request);
  if (!body) {
    return NextResponse.json(GENERIC_ERROR_MESSAGE, BAD_REQUEST_STATUS);
  }

  if (!hasValidCredentials(body)) {
    return NextResponse.json(GENERIC_ERROR_MESSAGE, BAD_REQUEST_STATUS);
  }

  const apiUrl = process.env.AUTH_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      API_URL_MISSING_MESSAGE,
      SERVICE_UNAVAILABLE_STATUS,
    );
  }

  // The application auth-api checks the logging-in user's access
  // against -- comes from a Secret (see infra-hub's
  // apps/ticket-hub/secret.example.yaml), never hardcoded.
  const applicationName = process.env.TICKET_HUB_APPLICATION_NAME;
  if (!applicationName) {
    return NextResponse.json(
      APPLICATION_NAME_MISSING_MESSAGE,
      SERVICE_UNAVAILABLE_STATUS,
    );
  }

  const apiResponse = await loginWithBackend(apiUrl, applicationName, body);
  if (!apiResponse) {
    return NextResponse.json(
      BACKEND_UNREACHABLE_MESSAGE,
      SERVICE_UNAVAILABLE_STATUS,
    );
  }

  if (isClientError(apiResponse)) {
    return NextResponse.json(GENERIC_ERROR_MESSAGE, UNAUTHORIZED_STATUS);
  }

  if (isServerError(apiResponse)) {
    return NextResponse.json(
      BACKEND_ERROR_MESSAGE,
      SERVICE_UNAVAILABLE_STATUS,
    );
  }

  const { access_token: accessToken } =
    (await apiResponse.json()) as BackendLoginResponse;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, accessToken, buildCookieOptions());

  // The token never reaches client JS: only an opaque success flag is returned.
  return NextResponse.json({ ok: true });
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.TICKET_HUB_COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  } as const;
}

async function loginWithBackend(
  apiUrl: string,
  applicationName: string,
  body: { email: string; password: string },
): Promise<Response | null> {
  const { email, password } = body;

  try {
    return await fetch(`${apiUrl}/internal-users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Application-Name": applicationName,
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach auth-api for login", error);
    return null;
  }
}

function isClientError(apiResponse: Response): boolean {
  return apiResponse.status >= 400 && apiResponse.status < 500;
}

function isServerError(apiResponse: Response): boolean {
  return apiResponse.status >= 500;
}

function hasValidCredentials(
  body: LoginRequestBody,
): body is { email: string; password: string } {
  return typeof body.email === "string" && typeof body.password === "string";
}

async function parseRequestBody(
  request: NextRequest,
): Promise<LoginRequestBody | null> {
  try {
    return await request.json();
  } catch (error) {
    console.error("Failed to parse login request body", error);
    return null;
  }
}
