import Link from "next/link";

/**
 * Fixed sub-header for the whole /home/users tree, same role
 * HomeHeader plays for /home: mounted once in users/layout.tsx, stays
 * visible across the landing, list, create, and edit routes instead
 * of only showing on the landing page.
 */
export default function UsersHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
      <Link
        href="/home/users/list"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        Ver usuarios
      </Link>
      <Link
        href="/home/users/create"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        Crear usuario
      </Link>
    </header>
  );
}
