"use client";

import { useEffect, useState } from "react";
import TicketsTable from "@/app/home/tickets/list/components/tickets-table/TicketsTable";
import { fetchTickets } from "@/app/home/tickets/tickets.api";
import type { TicketDetails, TicketType } from "@/app/home/tickets/tickets.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";

interface TicketsListViewProps {
  ticketType: TicketType;
  title: string;
}

/**
 * Shared by list/ansible/page.tsx and list/database/page.tsx -- both
 * fetch the exact same ticket list and only differ in which
 * ticketType they keep, so the fetch/filter/render logic lives here
 * once instead of duplicated per route. Promoted to list/'s own
 * components/ (not common/): both consumers stay inside the same
 * route family, per frontend-structure.md's promotion rule.
 *
 * Self-contained like the old single list page: fetches the ticket
 * list itself and re-fetches on every mount, i.e. every navigation
 * back here after a create/approve -- no cross-page state to
 * coordinate.
 */
export default function TicketsListView({
  ticketType,
  title,
}: TicketsListViewProps) {
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

  const filteredTickets = tickets.filter(
    (ticket) => ticket.ticketType === ticketType,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <TicketsTable
        tickets={filteredTickets}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
