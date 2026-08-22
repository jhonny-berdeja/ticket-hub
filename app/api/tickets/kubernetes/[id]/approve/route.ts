import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ticket-hub-token";
/**
 * 4 minutes plus a margin above every downstream hop: approving a
 * ticket runs a Kubernetes manifest apply (or Ansible/SQL) synchronously
 * through ticket-hub-api and pcbox-api before this request resolves, and
 * that execution alone can take up to 4 minutes
 * (pcbox-api's AnsibleConnector.PLAYBOOK_TIMEOUT_MS).
 */
const REQUEST_TIMEOUT_MS = 260_000;

const UNAUTHENTICATED_STATUS = { status: 401 } as const;
const SERVICE_UNAVAILABLE_STATUS = { status: 500 } as const;

const NOT_AUTHENTICATED_MESSAGE = { message: "Not authenticated." } as const;
const API_URL_MISSING_MESSAGE = {
  message: "Tickets service is not available right now.",
} as const;
const BACKEND_UNREACHABLE_MESSAGE = {
  message: "Could not reach the tickets service. Please try again.",
} as const;

type RouteContext = { params: Promise<{ id: string }> };

/** `id` here is the bare integer -- forwards to PATCH /tickets/kubernetes/:id/approve on the backend, the KUBERNETES-only approve endpoint. */
export async function PATCH(_request: Request, context: RouteContext) {
  const apiUrl = process.env.TICKET_HUB_API_URL;
  if (!apiUrl) {
    return NextResponse.json(API_URL_MISSING_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  const token = await readAuthToken();
  if (!token) {
    return NextResponse.json(NOT_AUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
  }

  const { id } = await context.params;
  const apiResponse = await approveKubernetesTicketInBackend(apiUrl, token, id);
  if (!apiResponse) {
    return NextResponse.json(BACKEND_UNREACHABLE_MESSAGE, SERVICE_UNAVAILABLE_STATUS);
  }

  return forwardBackendResponse(apiResponse);
}

async function readAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

async function approveKubernetesTicketInBackend(
  apiUrl: string,
  token: string,
  id: string,
): Promise<Response | null> {
  try {
    return await fetch(`${apiUrl}/tickets/kubernetes/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Failed to reach ticket-hub-api to approve a kubernetes ticket", error);
    return null;
  }
}

async function forwardBackendResponse(
  apiResponse: Response,
): Promise<NextResponse> {
  const body: unknown = await apiResponse.json().catch(() => null);
  return NextResponse.json(body, { status: apiResponse.status });
}
