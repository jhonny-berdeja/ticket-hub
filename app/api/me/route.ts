import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
const REQUEST_TIMEOUT_MS = 10_000;

const UNAUTHENTICATED_STATUS = { status: 401 } as const;
const SERVICE_UNAVAILABLE_STATUS = { status: 500 } as const;

const NOT_AUTHENTICATED_MESSAGE = { message: "Not authenticated." } as const;
const API_URL_MISSING_MESSAGE = {
  message: "Users service is not available right now.",
} as const;
const BACKEND_UNREACHABLE_MESSAGE = {
  message: "Could not reach the users service. Please try again.",
} as const;

export async function GET() {
  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(API_URL_MISSING_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  const token = await readAuthToken();
  if (!token) {
    return NextResponse.json(NOT_AUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
  }

  const apiResponse = await fetchCurrentUser(apiUrl, token);
  if (!apiResponse) {
    return NextResponse.json(BACKEND_UNREACHABLE_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  return forwardBackendResponse(apiResponse);
}

async function readAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

async function fetchCurrentUser(
  apiUrl: string,
  token: string,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach ticket-hub-api for the current user", error);
    return null;
  }
}

interface BackendMeResponse {
  msg: string;
  data: {
    sub: number;
    email: string;
    apps: { application: { roles: { name: string }[] } };
  };
}

/**
 * ticket-hub-api's /auth/me nests roles under apps.application.roles
 * (auth-api's token shape) -- flattened here to the roles: string[]
 * shape use-current-user.dto's CurrentUser expects, so the frontend
 * never has to know about that nesting.
 */
async function forwardBackendResponse(
  apiResponse: Response,
): Promise<NextResponse> {
  const body: unknown = await apiResponse.json().catch(() => null);
  if (!apiResponse.ok || !isBackendMeResponse(body)) {
    return NextResponse.json(body, { status: apiResponse.status });
  }

  const { sub, email, apps } = body.data;
  return NextResponse.json(
    {
      msg: body.msg,
      data: { sub, email, roles: apps.application.roles.map((role) => role.name) },
    },
    { status: apiResponse.status },
  );
}

function isBackendMeResponse(body: unknown): body is BackendMeResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "data" in body &&
    typeof (body as { data: unknown }).data === "object"
  );
}
