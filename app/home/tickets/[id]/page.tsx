"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import TicketDetail from "@/app/home/tickets/[id]/components/ticket-detail/TicketDetail";
import { fetchTickets } from "@/app/home/tickets/tickets.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";
const TICKETS_LIST_PATH = "/home/tickets/list";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Client component, so `params` (a Promise in Next.js 16 App
 * Router) is unwrapped with React's `use()`. There's no GET-by-id
 * endpoint, so this fetches the full list via the shared
 * tickets.api's fetchTickets() -- same as the list page -- and finds
 * the matching ticket client-side by the route's `id` param. Four
 * render states: loading, load failure, not found (id doesn't match
 * any ticket), and found. Mirrors app/home/users/[id]/edit/page.tsx.
 */
export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = use(params);

  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTickets()
      .then((loadedTickets) => {
        if (cancelled) return;
        setTickets(loadedTickets);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(LOAD_ERROR_MESSAGE);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const ticket = tickets.find((candidate) => candidate.id === Number(id));

  if (!ticket) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-gray-500">Ticket no encontrado.</p>
        <Link
          href={TICKETS_LIST_PATH}
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6">
        <TicketDetail key={id} ticket={ticket} />
      </div>
    </div>
  );
}
