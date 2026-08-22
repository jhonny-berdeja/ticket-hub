"use client";

import { useEffect, useState } from "react";
import TicketsTable from "@/app/home/tickets/list/components/tickets-table/TicketsTable";
import {
  fetchAnsibleTickets,
  fetchDatabaseTickets,
  fetchKubernetesTickets,
} from "@/app/home/tickets/tickets.api";
import type { TicketDetails, TicketType } from "@/app/home/tickets/tickets.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";

interface TicketsListViewProps {
  ticketType: TicketType;
  title: string;
}

/**
 * Shared by list/ansible/page.tsx and list/database/page.tsx -- both
 * render the exact same table and only differ in which kind of
 * ticket they fetch, so the fetch/render logic lives here once
 * instead of duplicated per route. Promoted to list/'s own
 * components/ (not common/): both consumers stay inside the same
 * route family, per frontend-structure.md's promotion rule.
 *
 * `ticketType` picks which already-scoped endpoint to call
 * (`GET /tickets/ansible` or `GET /tickets/database` on the backend,
 * via their matching proxy routes) -- there is no more merged list to
 * filter client-side, each response already contains only that kind.
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

    fetchTicketsFor(ticketType)
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
  }, [ticketType]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <TicketsTable tickets={tickets} isLoading={isLoading} error={error} />
    </div>
  );
}

/** Exhaustive switch so a future 4th ticket type can't silently fall into the wrong branch. */
function fetchTicketsFor(ticketType: TicketType): Promise<TicketDetails[]> {
  switch (ticketType) {
    case "ANSIBLE":
      return fetchAnsibleTickets();
    case "DATABASE":
      return fetchDatabaseTickets();
    case "KUBERNETES":
      return fetchKubernetesTickets();
    default: {
      const exhaustiveCheck: never = ticketType;
      throw new Error(`Unknown ticket type: ${String(exhaustiveCheck)}`);
    }
  }
}
