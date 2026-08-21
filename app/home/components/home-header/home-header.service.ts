import { TicketNotFoundError } from "@/app/home/components/home-header/home-header.api";

const TICKET_NUMBER_PATTERN = /^(DC|DB)-\d+$/;
const TICKET_NOT_FOUND_MESSAGE = "No se encontró ese ticket.";
const SEARCH_ERROR_MESSAGE = "No se pudo buscar el ticket. Intentá de nuevo.";
export const INVALID_TICKET_NUMBER_MESSAGE =
  "Ingresá un número de ticket válido (DC-1 o DB-1).";

/**
 * Pure parsing rule, no React involved. Only normalizes case and
 * surrounding whitespace now — the prefix is no longer stripped, since
 * after the datacenter/database ticket table split each table keeps
 * its own number sequence, so the backend needs the full "DC-<n>" /
 * "DB-<n>" string to know which table to search. Returns null when the
 * input isn't a valid "DC-<digits>" / "DB-<digits>" ticket number
 * (including an empty one).
 */
export function parseTicketNumber(searchValue: string): string | null {
  const normalized = searchValue.trim().toUpperCase();
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
