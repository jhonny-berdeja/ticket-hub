"use client";

import { useEffect, useState } from "react";
import CreateTicketForm from "@/components/CreateTicketForm";
import TicketDetailsModal, {
  type TicketDetails,
} from "@/components/TicketDetailsModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ADMIN_ROLE = "ADMIN";
const APPROVER_ROLE = "APPROVER";
const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de tickets.";

export default function Home() {
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
  // Same refreshKey + effect pattern as /home/usuarios: the effect owns
  // all fetching, driven by this dependency changing, never by a
  // directly-invoked async loader (react-hooks/set-state-in-effect
  // flags that shape even when the setState calls are after an await).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/tickets")
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setError(LOAD_ERROR_MESSAGE);
          setIsLoading(false);
          return;
        }
        return response.json().then((body: { data: TicketDetails[] }) => {
          if (cancelled) return;
          setTickets(body.data);
          setIsLoading(false);
        });
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
        <h1 className="text-xl font-semibold text-gray-900">Ticket Hub</h1>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear ticket
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Número
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Datacenter
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Asunto
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No hay tickets.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-900">{ticket.number}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {ticket.department}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{ticket.subject}</td>
                  <td className="px-4 py-3 text-gray-900">{ticket.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
