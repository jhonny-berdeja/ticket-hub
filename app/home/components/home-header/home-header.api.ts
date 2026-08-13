import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

/** Logs the current user out. Never throws - the httpOnly cookie can't be cleared client-side anyway. */
export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
}

/** Thrown when the ticket lookup resolves but no ticket matches the number. */
export class TicketNotFoundError extends Error {}

/** Looks up a ticket by its bare number (no "TK-" prefix). Rejects with TicketNotFoundError on a non-ok response; any other rejection means a network failure. */
export async function searchTicketByNumber(
  bareNumber: string,
): Promise<TicketDetails> {
  const response = await fetch(`/api/tickets/by-number/${bareNumber}`);
  if (!response.ok) {
    throw new TicketNotFoundError("Ticket not found");
  }
  const body = (await response.json()) as { data: TicketDetails };
  return body.data;
}
