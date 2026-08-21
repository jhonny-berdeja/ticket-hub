const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";

interface CreateAnsibleTicketPayload {
  assignee: string;
  department: string;
  subject: string;
  description: string;
  ticketType: "ANSIBLE";
  codeAnsible?: string;
}

/** Thrown for a non-ok response, carrying the server's message (or the generic fallback). */
export class CreateTicketApiError extends Error {}

/** Creates an ANSIBLE ticket. Rejects with CreateTicketApiError on a non-ok response; any other rejection means a network failure. */
export async function createTicket(
  payload: CreateAnsibleTicketPayload,
): Promise<void> {
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
