"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  logout,
  searchTicketByNumber,
} from "@/app/home/components/home-header/home-header.api";
import {
  parseTicketNumber,
  resolveSearchErrorMessage,
} from "@/app/home/components/home-header/home-header.service";

/**
 * Shared chrome for every page under /home: the header (ticket search,
 * Cerrar sesión, avatar). A found ticket navigates to its detail route
 * instead of opening a context-driven modal -- there's no shared
 * ticket-modal state left to reach into.
 */
export default function HomeHeader() {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

    const bareNumber = parseTicketNumber(searchValue);
    if (!bareNumber) {
      return;
    }

    setSearchError(null);
    setIsSearching(true);
    try {
      const ticket = await searchTicketByNumber(bareNumber);
      router.push(`/home/tickets/${ticket.id}`);
    } catch (error) {
      setSearchError(resolveSearchErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <div />

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
    </>
  );
}
