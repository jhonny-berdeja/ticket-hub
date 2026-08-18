/**
 * Landing for the Tickets section: structure only. The entry points
 * into the routed flows (viewing the list, creating a ticket) now live
 * in TicketsSidebar, mounted once in tickets/layout.tsx and visible
 * across this whole section -- no need to repeat them here.
 */
export default function TicketsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Tickets</h1>
    </div>
  );
}
