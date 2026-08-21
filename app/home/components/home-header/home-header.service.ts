import { TicketNotFoundError } from "@/app/home/tickets/tickets.api";

const TICKET_NUMBER_PATTERN = /^\d+$/;
const TICKET_NOT_FOUND_MESSAGE = "No se encontró ese ticket.";
const SEARCH_ERROR_MESSAGE = "No se pudo buscar el ticket. Intentá de nuevo.";
export const INVALID_TICKET_NUMBER_MESSAGE =
  "Ingresá un número de ticket válido.";

/**
 * Pure parsing rule, no React involved. Only normalizes surrounding
 * whitespace now -- the ticket type is no longer part of this input,
 * it's selected separately via HomeHeader's type dropdown and passed
 * to the search flow alongside this bare number. Returns null for
 * anything that isn't digits-only (including an empty input).
 */
export function parseTicketNumber(searchValue: string): string | null {
  const normalized = searchValue.trim();
  return TICKET_NUMBER_PATTERN.test(normalized) ? normalized : null;
}

/**
 * Pure mapping from a caught search error to the message shown to the
 * user — distinguishes "no existe ese ticket" from any other failure
 * (network, server) without the caller needing to know why.
 */
export function resolveSearchErrorMessage(error: unknown): string {
  return error instanceof TicketNotFoundError
    ? TICKET_NOT_FOUND_MESSAGE
    : SEARCH_ERROR_MESSAGE;
}
