import { TicketNotFoundError } from "@/app/home/components/home-header/home-header.api";

const NUMBER_PREFIX = "TK-";
const TICKET_NOT_FOUND_MESSAGE = "No se encontró ese ticket.";
const SEARCH_ERROR_MESSAGE = "No se pudo buscar el ticket. Intentá de nuevo.";

/**
 * Pure parsing rule, no React involved. Accepts "TK-5" or just "5" and
 * always returns the bare integer string the API expects — case and
 * surrounding whitespace don't matter to the caller.
 */
export function parseTicketNumber(searchValue: string): string {
  return searchValue
    .trim()
    .toUpperCase()
    .replace(new RegExp(`^${NUMBER_PREFIX}`), "");
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
