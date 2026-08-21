import type { DbTarget, TicketDetails } from "@/app/home/tickets/tickets.dto";

const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";
const DB_TARGETS_ERROR_MESSAGE =
  "No se pudieron cargar las bases de datos disponibles.";

interface CreateDatabaseTicketPayload {
  assignee: string;
  department: string;
  subject: string;
  description: string;
  namespace: string;
  deployment: string;
  dbName: string;
  sqlCode: string;
}

/** Thrown for a non-ok response, carrying the server's message (or the generic fallback). */
export class CreateTicketApiError extends Error {}

/** Creates a DATABASE ticket and returns the created ticket. Rejects with CreateTicketApiError on a non-ok response; any other rejection means a network failure. */
export async function createTicket(
  payload: CreateDatabaseTicketPayload,
): Promise<TicketDetails> {
  const response = await fetch("/api/tickets/database", {
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

/** Fetches the server-owned allowlist of DATABASE targets. Throws on a non-ok response or network failure. */
export async function fetchDbTargets(): Promise<DbTarget[]> {
  const response = await fetch("/api/tickets/db-targets");
  if (!response.ok) {
    throw new Error(DB_TARGETS_ERROR_MESSAGE);
  }
  const body: { data: DbTarget[] } = await response.json();
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
