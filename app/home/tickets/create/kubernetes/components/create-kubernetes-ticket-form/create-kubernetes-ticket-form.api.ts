import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";

interface CreateKubernetesTicketPayload {
  assignee: string;
  department: string;
  subject: string;
  description: string;
  codeYaml?: string;
}

/** Thrown for a non-ok response, carrying the server's message (or the generic fallback). */
export class CreateTicketApiError extends Error {}

/** Creates a KUBERNETES ticket and returns the created ticket. Rejects with CreateTicketApiError on a non-ok response; any other rejection means a network failure. */
export async function createTicket(
  payload: CreateKubernetesTicketPayload,
): Promise<TicketDetails> {
  const response = await fetch("/api/tickets/kubernetes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new CreateTicketApiError(await readErrorMessage(response));
  }

  const body: { data: TicketDetails } = await response.json();
  return body.data;
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
