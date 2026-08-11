"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TicketDetailsModal, {
  type TicketDetails,
} from "@/components/TicketDetailsModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ADMIN_ROLE = "ADMIN";
const APPROVER_ROLE = "APPROVER";
const NUMBER_PREFIX = "TK-";
const TICKET_NOT_FOUND_MESSAGE = "No se encontró ese ticket.";
const SEARCH_ERROR_MESSAGE = "No se pudo buscar el ticket. Intentá de nuevo.";

/**
 * Shared chrome for every page under /home: the header (ABMC Usuarios,
 * ticket search, Cerrar sesión, avatar) stays visible while only the
 * page content below it changes - /home and /home/usuarios both render
 * through here via `children`. "Crear ticket" lives in app/home/page.tsx
 * instead, alongside the ticket list it needs to refresh after a create -
 * it doesn't make sense floating over /home/usuarios anyway.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status: authStatus, user } = useCurrentUser();
  const isAdmin =
    authStatus === "authenticated" &&
    user !== null &&
    user.roles.includes(ADMIN_ROLE);
  const canApproveTickets =
    authStatus === "authenticated" &&
    user !== null &&
    (user.roles.includes(ADMIN_ROLE) || user.roles.includes(APPROVER_ROLE));

  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundTicket, setFoundTicket] = useState<TicketDetails | null>(null);

  // No error handling on the fetch: even if it fails, the cookie can't
  // be cleared client-side (httpOnly), so redirecting to /login
  // regardless still gets the user out of any protected page - the
  // proxy bounces back here again if the cookie somehow survived.
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
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
      const response = await fetch(`/api/tickets/by-number/${bareNumber}`);
      if (!response.ok) {
        setSearchError(TICKET_NOT_FOUND_MESSAGE);
        return;
      }
      const body = (await response.json()) as { data: TicketDetails };
      setFoundTicket(body.data);
    } catch {
      setSearchError(SEARCH_ERROR_MESSAGE);
    } finally {
      setIsSearching(false);
    }
  }

  function handleApproved() {
    setFoundTicket(null);
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/home/usuarios"
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

      <main className="flex flex-1 flex-col">{children}</main>

      {foundTicket && (
        <TicketDetailsModal
          ticket={foundTicket}
          canApprove={canApproveTickets}
          onClose={() => setFoundTicket(null)}
          onApproved={handleApproved}
        />
      )}
    </div>
  );
}
