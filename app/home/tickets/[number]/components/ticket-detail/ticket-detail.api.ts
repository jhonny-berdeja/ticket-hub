import { ticketTypePathSegment } from "@/app/home/tickets/tickets.api";
import type { TicketDetails, TicketType } from "@/app/home/tickets/tickets.dto";

/**
 * Approves the given ticket and returns the updated ticket (new status,
 * execution response, etc). `ticketType` states which table the id lives
 * in -- `datacenter_tickets` and `database_tickets` each keep their own
 * `id` sequence, so a bare `id` alone is ambiguous across types. Throws on
 * a non-ok response or network failure.
 */
export async function approveTicket(
  ticketType: TicketType,
  ticketId: number,
): Promise<TicketDetails> {
  const typeSegment = ticketTypePathSegment(ticketType);
  const response = await fetch(`/api/tickets/${typeSegment}/${ticketId}/approve`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to approve ticket");
  }
  const body: { data: TicketDetails } = await response.json();
  return body.data;
}
