import Link from "next/link";

/**
 * Landing for the Users section: structure + composition only, no
 * fetching, no state. Just the two entry points into the routed
 * flows -- viewing the list and creating a user.
 */
export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Usuarios</h1>

      <div className="flex gap-3">
        <Link
          href="/home/users/list"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Ver usuarios
        </Link>
        <Link
          href="/home/users/create"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Crear usuario
        </Link>
      </div>
    </div>
  );
}
