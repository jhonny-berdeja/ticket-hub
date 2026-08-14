import NavLink from "@/common/nav-link/NavLink";

/**
 * Fixed sub-header for the whole /home/users tree, same role
 * HomeHeader plays for /home: mounted once in users/layout.tsx, stays
 * visible across the landing, list, create, and edit routes instead
 * of only showing on the landing page.
 */
export default function UsersHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
      <NavLink href="/home/users/list">Ver usuarios</NavLink>
      <NavLink href="/home/users/create">Crear usuario</NavLink>
    </header>
  );
}
