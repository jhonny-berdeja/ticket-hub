import NavLink from "@/common/nav-link/NavLink";

/**
 * Left-side nav for the whole authenticated app, same role TicketsHeader
 * played before it: mounted once in home/layout.tsx, stays visible across
 * every /home route instead of only showing on the tickets landing page.
 */
export default function TicketsSidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-1 border-r border-gray-200 bg-white p-4">
      <NavLink href="/home/tickets/list">Ver tickets</NavLink>
      <NavLink href="/home/tickets/create/ansible">
        Crear ticket Centro de Datos
      </NavLink>
      <NavLink href="/home/tickets/create/database">
        Crear ticket Base de datos
      </NavLink>
    </aside>
  );
}
