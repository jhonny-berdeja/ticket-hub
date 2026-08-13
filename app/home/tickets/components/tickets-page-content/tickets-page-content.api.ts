import type { TicketDetails } from "@/common/ticket-details-modal/ticket-details-modal.dto";

/** Fetches the full ticket list. Throws on a non-ok response or network failure. */
export async function fetchTickets(): Promise<TicketDetails[]> {
  const response = await fetch("/api/tickets");
  if (!response.ok) {
    throw new Error("Failed to load tickets");
  }
  const body: { data: TicketDetails[] } = await response.json();
  return body.data;
}
