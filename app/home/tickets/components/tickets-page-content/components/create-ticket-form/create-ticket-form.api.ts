import type { Approver } from "@/app/home/tickets/components/tickets-page-content/components/create-ticket-form/create-ticket-form.dto";

const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";

interface CreateTicketPayload {
  assignee: number;
  department: string;
  subject: string;
  description: string;
  codeAnsible: string | undefined;
}

/** Fetches the users eligible to be assigned a ticket (approvers/admins). Resolves to an empty list on failure. */
export async function fetchApprovers(): Promise<Approver[]> {
  const response = await fetch("/api/users/approvers");
  if (!response.ok) {
    throw new Error("Failed to load approvers");
  }
  const body: { data: Approver[] } = await response.json();
  return body.data;
}

/** Thrown for a non-ok response, carrying the server's message (or the generic fallback). */
export class CreateTicketApiError extends Error {}

/** Creates a ticket. Rejects with CreateTicketApiError on a non-ok response; any other rejection means a network failure. */
export async function createTicket(payload: CreateTicketPayload): Promise<void> {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new CreateTicketApiError(await readErrorMessage(response));
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return GENERIC_ERROR_MESSAGE;
}
