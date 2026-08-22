import type {
  AssignableUser,
  TicketDetails,
  TicketType,
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

/** Fetches only KUBERNETES tickets. Throws on a non-ok response or network failure. */
export async function fetchKubernetesTickets(): Promise<TicketDetails[]> {
  const response = await fetch("/api/tickets/kubernetes");
  if (!response.ok) {
    throw new Error("Failed to load kubernetes tickets");
  }
  const body: { data: TicketDetails[] } = await response.json();
  return body.data;
}

/** Thrown when the ticket lookup resolves but no ticket matches the number. */
export class TicketNotFoundError extends Error {}

/**
 * Looks up a ticket by its explicit type and bare number -- the caller
 * states which table to search directly, the backend never parses a
 * prefix out of a combined string. `datacenter_tickets` and
 * `database_tickets` each keep their own internal `id` sequence, so
 * `number` alone is ambiguous across types; this is the single-ticket
 * lookup every consumer that resolves "the ticket behind this
 * identifier" should use instead of scanning the full list by `id`.
 * Promoted here (rather than left in home-header.api.ts, its original
 * home) since TicketDetailPage now needs the exact same lookup -- same
 * reasoning as `fetchAssignableUsers` above. Rejects with
 * TicketNotFoundError on a non-ok response; any other rejection means
 * a network failure.
 */
export async function searchTicketByNumber(
  ticketType: TicketType,
  number: string,
): Promise<TicketDetails> {
  const typeSegment = ticketTypePathSegment(ticketType);
  const response = await fetch(`/api/tickets/${typeSegment}/by-number/${number}`);
  if (!response.ok) {
    throw new TicketNotFoundError("Ticket not found");
  }
  const body = (await response.json()) as { data: TicketDetails };
  return body.data;
}

/**
 * Maps the internal `TicketType` to the path segment its dedicated routes
 * use. Exhaustive switch (not `===`/`else`) so a future 4th ticket type
 * can't silently fall through into the wrong route -- the `default` branch
 * throws instead.
 */
export function ticketTypePathSegment(
  ticketType: TicketType,
): "ansible" | "database" | "kubernetes" {
  switch (ticketType) {
    case "ANSIBLE":
      return "ansible";
    case "DATABASE":
      return "database";
    case "KUBERNETES":
      return "kubernetes";
    default: {
      const exhaustiveCheck: never = ticketType;
      throw new Error(`Unknown ticket type: ${String(exhaustiveCheck)}`);
    }
  }
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
