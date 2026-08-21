import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

/** Approves the given ticket and returns the updated ticket (new status, execution response, etc). Throws on a non-ok response or network failure. */
export async function approveTicket(ticketId: number): Promise<TicketDetails> {
  const response = await fetch(`/api/tickets/${ticketId}/approve`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to approve ticket");
  }
  const body: { data: TicketDetails } = await response.json();
  return body.data;
}
