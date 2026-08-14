"use client";

import { useEffect, useState } from "react";
import TicketsTable from "@/app/home/tickets/list/components/tickets-table/TicketsTable";
import { fetchTickets } from "@/app/home/tickets/tickets.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";

/**
 * Self-contained, like the Users list page: fetches the ticket list
 * itself and re-fetches on every mount, i.e. every navigation back
 * here after a create/approve -- no cross-page state to coordinate
 * anymore.
 */
export default function TicketsListPage() {
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Tickets</h1>

      <TicketsTable tickets={tickets} isLoading={isLoading} error={error} />
    </div>
  );
}
