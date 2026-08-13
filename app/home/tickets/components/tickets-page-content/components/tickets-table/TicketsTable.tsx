import type { TicketDetails } from "@/common/ticket-details-modal/ticket-details-modal.dto";

interface TicketsTableProps {
  tickets: TicketDetails[];
  isLoading: boolean;
  error: string | null;
  onSelectTicket: (ticket: TicketDetails) => void;
}

/**
 * Owns rendering the ticket list: receives tickets/isLoading/error and
 * the row-click callback as props from TicketsPageContent (its direct
 * parent) — plain parent-to-child data flow, no Context needed here.
 */
export default function TicketsTable({
  tickets,
  isLoading,
  error,
  onSelectTicket,
}: TicketsTableProps) {
  return (
    <div className="flex flex-col gap-4">
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
                  onClick={() => onSelectTicket(ticket)}
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
    </div>
  );
}
