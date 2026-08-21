import type {
  AssignableUser,
  TicketDetails,
} from "@/app/home/tickets/tickets.dto";

/** Fetches the full ticket list. Throws on a non-ok response or network failure. */
export async function fetchTickets(): Promise<TicketDetails[]> {
  const response = await fetch("/api/tickets");
  if (!response.ok) {
    throw new Error("Failed to load tickets");
  }
  const body: { data: TicketDetails[] } = await response.json();
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
