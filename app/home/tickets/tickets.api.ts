import type {
  AssignableUser,
  TicketDetails,
} from "@/app/home/tickets/tickets.dto";

/** Fetches only ANSIBLE (datacenter) tickets. Throws on a non-ok response or network failure. */
export async function fetchAnsibleTickets(): Promise<TicketDetails[]> {
  const response = await fetch("/api/tickets/ansible");
  if (!response.ok) {
    throw new Error("Failed to load ansible tickets");
  }
  const body: { data: TicketDetails[] } = await response.json();
  return body.data;
}

/** Fetches only DATABASE tickets. Throws on a non-ok response or network failure. */
export async function fetchDatabaseTickets(): Promise<TicketDetails[]> {
  const response = await fetch("/api/tickets/database");
  if (!response.ok) {
    throw new Error("Failed to load database tickets");
  }
  const body: { data: TicketDetails[] } = await response.json();
  return body.data;
}

/** Thrown when the ticket lookup resolves but no ticket matches the number. */
export class TicketNotFoundError extends Error {}

/**
 * Looks up a ticket by its full display number, prefix included (e.g.
 * "DC-1", "DB-1") -- the prefix tells the backend which ticket table
 * to search. `datacenter_tickets` and `database_tickets` each keep
 * their own internal `id` sequence, so `number` is the only value
 * that uniquely identifies a ticket; this is the single-ticket lookup
 * every consumer that resolves "the ticket behind this identifier"
 * should use instead of scanning the full list by `id`. Promoted here
 * (rather than left in home-header.api.ts, its original home) since
 * TicketDetailPage now needs the exact same lookup -- same reasoning
 * as `fetchAssignableUsers` above. Rejects with TicketNotFoundError on
 * a non-ok response; any other rejection means a network failure.
 */
export async function searchTicketByNumber(
  ticketNumber: string,
): Promise<TicketDetails> {
  const response = await fetch(`/api/tickets/by-number/${ticketNumber}`);
  if (!response.ok) {
    throw new TicketNotFoundError("Ticket not found");
  }
  const body = (await response.json()) as { data: TicketDetails };
  return body.data;
}

/**
 * Fetches the allowlisted assignable users (ADMIN role on ticket-hub) that
 * feed the "Asignar a" dropdown. Shared by CreateAnsibleTicketForm and
 * CreateDatabaseTicketForm -- both live under app/home/tickets/create/, so
 * this is promoted to their common ancestor instead of duplicated per form.
 * Throws on a non-ok response or network failure.
 */
export async function fetchAssignableUsers(): Promise<AssignableUser[]> {
  const response = await fetch("/api/tickets/assignable-users");
  if (!response.ok) {
    throw new Error("Failed to load assignable users");
  }
  const body: { data: AssignableUser[] } = await response.json();
  return body.data;
}
