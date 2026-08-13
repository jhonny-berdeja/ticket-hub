/** Approves the given ticket. Throws on a non-ok response or network failure. */
export async function approveTicket(ticketId: number): Promise<void> {
  const response = await fetch(`/api/tickets/${ticketId}/approve`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to approve ticket");
  }
}
