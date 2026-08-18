import NavLink from "@/common/nav-link/NavLink";

/**
 * Fixed sub-nav for the whole /home/tickets tree, same role TicketsHeader
 * played: mounted once in tickets/layout.tsx, stays visible across the
 * landing, list, create, and detail routes instead of only showing on the
 * landing page.
 */
export default function TicketsSidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-1 border-r border-gray-200 bg-white p-4">
      <NavLink href="/home/tickets/list">Ver tickets</NavLink>
      <NavLink href="/home/tickets/create">Crear ticket</NavLink>
    </aside>
  );
}
