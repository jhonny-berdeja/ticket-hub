"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TicketDetailsModal from "@/common/ticket-details-modal/TicketDetailsModal";
import type { TicketDetails } from "@/common/ticket-details-modal/ticket-details-modal.dto";
import {
  logout,
  searchTicketByNumber,
  TicketNotFoundError,
} from "@/app/home/components/home-header/home-header.api";

const NUMBER_PREFIX = "TK-";
const TICKET_NOT_FOUND_MESSAGE = "No se encontró ese ticket.";
const SEARCH_ERROR_MESSAGE = "No se pudo buscar el ticket. Intentá de nuevo.";

interface HomeHeaderProps {
  isAdmin: boolean;
  canApproveTickets: boolean;
}

/**
 * Shared chrome for every page under /home: the header (ABMC Tickets,
 * ABMC Usuarios, ticket search, Cerrar sesión, avatar) plus the ticket
 * search result modal. isAdmin/canApproveTickets come from HomeLayout
 * as plain parent-to-child props - both are derived once from
 * useCurrentUser and only used for conditional rendering here, so no
 * Context is needed.
 */
export default function HomeHeader({ isAdmin, canApproveTickets }: HomeHeaderProps) {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundTicket, setFoundTicket] = useState<TicketDetails | null>(null);

  // No error handling on the fetch: even if it fails, the cookie can't
  // be cleared client-side (httpOnly), so redirecting to /login
  // regardless still gets the user out of any protected page - the
  // proxy bounces back here again if the cookie somehow survived.
  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Accepts "TK-5" or just "5" - strips the prefix either way before
    // hitting the API, which only deals in the bare integer.
    const bareNumber = searchValue.trim().toUpperCase().replace(
      new RegExp(`^${NUMBER_PREFIX}`),
      "",
    );
    if (!bareNumber) {
      return;
    }

    setSearchError(null);
    setIsSearching(true);
    try {
      const ticket = await searchTicketByNumber(bareNumber);
      setFoundTicket(ticket);
    } catch (error) {
      setSearchError(
        error instanceof TicketNotFoundError
          ? TICKET_NOT_FOUND_MESSAGE
          : SEARCH_ERROR_MESSAGE,
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleApproved() {
    setFoundTicket(null);
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/home/tickets"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ABMC Tickets
          </Link>

          {isAdmin && (
            <Link
              href="/home/users"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              ABMC Usuarios
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={(event) => void handleSearch(event)} className="flex items-center gap-2">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar ticket (TK-1)"
              aria-label="Buscar ticket por número"
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cerrar sesión
          </button>

          <button
            type="button"
            className="h-10 w-10 rounded-full bg-gray-300"
            aria-label="Perfil de usuario"
          />
        </div>
      </header>

      {searchError && (
        <p className="border-b border-gray-200 bg-white px-6 py-2 text-sm text-red-600">
          {searchError}
        </p>
      )}

      {foundTicket && (
        <TicketDetailsModal
          ticket={foundTicket}
          canApprove={canApproveTickets}
          onClose={() => setFoundTicket(null)}
          onApproved={handleApproved}
        />
      )}
    </>
  );
}
