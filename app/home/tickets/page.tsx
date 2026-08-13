import Link from "next/link";

/**
 * Landing for the Tickets section: structure + composition only, no
 * fetching, no state. Just the two entry points into the routed
 * flows -- viewing the list and creating a ticket. Mirrors
 * app/home/users/page.tsx.
 */
export default function TicketsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Tickets</h1>

      <div className="flex gap-3">
        <Link
          href="/home/tickets/list"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Ver tickets
        </Link>
        <Link
          href="/home/tickets/create"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Crear ticket
        </Link>
      </div>
    </div>
  );
}
