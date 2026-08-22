import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
const REQUEST_TIMEOUT_MS = 10_000;

const BAD_REQUEST_STATUS = { status: 400 } as const;
const UNAUTHENTICATED_STATUS = { status: 401 } as const;
const SERVICE_UNAVAILABLE_STATUS = { status: 500 } as const;

const NOT_AUTHENTICATED_MESSAGE = { message: "Not authenticated." } as const;
const API_URL_MISSING_MESSAGE = {
  message: "Tickets service is not available right now.",
} as const;
const BACKEND_UNREACHABLE_MESSAGE = {
  message: "Could not reach the tickets service. Please try again.",
} as const;
const INVALID_BODY_MESSAGE = { message: "Invalid request body." } as const;

/** Forwards to GET /tickets/kubernetes on the backend — the KUBERNETES-only list endpoint. */
export async function GET() {
  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(API_URL_MISSING_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  const token = await readAuthToken();
  if (!token) {
    return NextResponse.json(NOT_AUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
  }

  const apiResponse = await listKubernetesTicketsFromBackend(apiUrl, token);
  if (!apiResponse) {
    return NextResponse.json(BACKEND_UNREACHABLE_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  return forwardBackendResponse(apiResponse);
}

/** Forwards to POST /tickets/kubernetes on the backend — the KUBERNETES-only create endpoint. */
export async function POST(request: NextRequest) {
  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(API_URL_MISSING_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  const token = await readAuthToken();
  if (!token) {
    return NextResponse.json(NOT_AUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
  }

  const body = await parseRequestBody(request);
  if (!body) {
    return NextResponse.json(INVALID_BODY_MESSAGE, BAD_REQUEST_STATUS);
  }

  const apiResponse = await createKubernetesTicketInBackend(apiUrl, token, body);
  if (!apiResponse) {
    return NextResponse.json(BACKEND_UNREACHABLE_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  return forwardBackendResponse(apiResponse);
}

async function readAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

async function listKubernetesTicketsFromBackend(
  apiUrl: string,
  token: string,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}/tickets/kubernetes`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach ticket-hub-api for the kubernetes ticket list", error);
    return null;
  }
}

async function parseRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    console.error("Failed to parse tickets request body", error);
    return null;
  }
}

async function createKubernetesTicketInBackend(
  apiUrl: string,
  token: string,
  body: unknown,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}/tickets/kubernetes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach ticket-hub-api to create a kubernetes ticket", error);
    return null;
  }
}

async function forwardBackendResponse(
  apiResponse: Response,
): Promise<NextResponse> {
  const body: unknown = await apiResponse.json().catch(() => null);
  return NextResponse.json(body, { status: apiResponse.status });
}
