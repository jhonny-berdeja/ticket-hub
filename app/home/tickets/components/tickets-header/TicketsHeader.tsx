import NavLink from "@/common/nav-link/NavLink";

/**
 * Fixed sub-header for the whole /home/tickets tree, same role
 * HomeHeader plays for /home: mounted once in tickets/layout.tsx,
 * stays visible across the landing, list, create, and detail routes
 * instead of only showing on the landing page.
 */
export default function TicketsHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
      <NavLink href="/home/tickets/list">Ver tickets</NavLink>
      <NavLink href="/home/tickets/create">Crear ticket</NavLink>
    </header>
  );
}
