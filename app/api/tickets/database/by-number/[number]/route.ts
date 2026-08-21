import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
const REQUEST_TIMEOUT_MS = 10_000;

const UNAUTHENTICATED_STATUS = { status: 401 } as const;
const SERVICE_UNAVAILABLE_STATUS = { status: 500 } as const;

const NOT_AUTHENTICATED_MESSAGE = { message: "Not authenticated." } as const;
const API_URL_MISSING_MESSAGE = {
  message: "Tickets service is not available right now.",
} as const;
const BACKEND_UNREACHABLE_MESSAGE = {
  message: "Could not reach the tickets service. Please try again.",
} as const;

type RouteContext = { params: Promise<{ number: string }> };

/** `number` here is the bare integer, no prefix -- forwards to GET /tickets/database/by-number/:number on the backend, the DATABASE-only lookup endpoint. */
export async function GET(_request: Request, context: RouteContext) {
  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(API_URL_MISSING_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  const token = await readAuthToken();
  if (!token) {
    return NextResponse.json(NOT_AUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
  }

  const { number } = await context.params;
  const apiResponse = await findDatabaseTicketByNumberInBackend(apiUrl, token, number);
  if (!apiResponse) {
    return NextResponse.json(BACKEND_UNREACHABLE_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  return forwardBackendResponse(apiResponse);
}

async function readAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

async function findDatabaseTicketByNumberInBackend(
  apiUrl: string,
  token: string,
  number: string,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}/tickets/database/by-number/${number}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach ticket-hub-api to find a database ticket by number", error);
    return null;
  }
}

async function forwardBackendResponse(
  apiResponse: Response,
): Promise<NextResponse> {
  const body: unknown = await apiResponse.json().catch(() => null);
  return NextResponse.json(body, { status: apiResponse.status });
}
