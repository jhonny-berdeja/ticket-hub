"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import TicketDetail from "@/app/home/tickets/[number]/components/ticket-detail/TicketDetail";
import {
  TicketNotFoundError,
  searchTicketByNumber,
} from "@/app/home/tickets/tickets.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar el ticket.";
const NOT_FOUND_MESSAGE = "Ticket no encontrado.";
const HOME_PATH = "/home";

interface TicketDetailPageProps {
  params: Promise<{ number: string }>;
}

/**
 * Client component, so `params` (a Promise in Next.js 16 App Router)
 * is unwrapped with React's `use()`. `datacenter_tickets` and
 * `database_tickets` each keep their own internal `id` sequence, so
 * an `id`-based lookup is ambiguous (both tables can have a ticket
 * with the same `id`) -- this route is keyed by the ticket's unique
 * display `number` (e.g. "DC-1", "DB-1") instead, and fetches that one
 * ticket directly via the same by-number lookup HomeHeader's search
 * uses, rather than fetching the full list and scanning it by `id`.
 * Four render states: loading, load failure, not found (backend
 * returned no match for this number), and found.
 */
export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { number } = use(params);

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    searchTicketByNumber(number)
      .then((loadedTicket) => {
        if (cancelled) return;
        setTicket(loadedTicket);
        setIsLoading(false);
      })
      .catch((searchError) => {
        if (cancelled) return;
        if (searchError instanceof TicketNotFoundError) {
          setNotFound(true);
        } else {
          setError(LOAD_ERROR_MESSAGE);
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [number]);

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

  if (notFound || !ticket) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-gray-500">{NOT_FOUND_MESSAGE}</p>
        <Link
          href={HOME_PATH}
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6">
        <TicketDetail key={number} ticket={ticket} />
      </div>
    </div>
  );
}
