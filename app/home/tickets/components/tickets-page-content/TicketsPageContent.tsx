"use client";

import { useEffect, useState } from "react";
import CreateTicketForm from "@/app/home/tickets/components/tickets-page-content/components/create-ticket-form/CreateTicketForm";
import TicketsTable from "@/app/home/tickets/components/tickets-page-content/components/tickets-table/TicketsTable";
import TicketDetailsModal from "@/common/ticket-details-modal/TicketDetailsModal";
import type { TicketDetails } from "@/common/ticket-details-modal/ticket-details-modal.dto";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";
import { fetchTickets } from "@/app/home/tickets/components/tickets-page-content/tickets-page-content.api";

const ADMIN_ROLE = "ADMIN";
const APPROVER_ROLE = "APPROVER";
const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";

export default function TicketsPageContent() {
  const { status: authStatus, user } = useCurrentUser();
  const canApproveTickets =
    authStatus === "authenticated" &&
    user !== null &&
    (user.roles.includes(ADMIN_ROLE) || user.roles.includes(APPROVER_ROLE));

  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetails | null>(
    null,
  );
  // Same refreshKey + effect pattern as /home/users: the effect owns
  // all fetching, driven by this dependency changing, never by a
  // directly-invoked async loader (react-hooks/set-state-in-effect
  // flags that shape even when the setState calls are after an await).
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

  function handleCreated() {
    setIsFormOpen(false);
    setIsLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }

  function handleApproved() {
    setSelectedTicket(null);
    setIsLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">ABMC Tickets</h1>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear ticket
        </button>
      </div>

      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        onSelectTicket={setSelectedTicket}
      />

      {isFormOpen && (
        <CreateTicketForm
          onClose={() => setIsFormOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          canApprove={canApproveTickets}
          onClose={() => setSelectedTicket(null)}
          onApproved={handleApproved}
        />
      )}
    </div>
  );
}
