import { useUsersContext } from "@/app/home/users/components/users-context/use-users-context";
import UserRow from "@/app/home/users/components/users-page-content/components/users-table/components/user-row/UserRow";

/**
 * Owns rendering the user list: reads users/isLoading/error straight
 * from UsersContext (no props from UsersPage), and renders one
 * UserRow per user.
 */
export default function UsersTable() {
  const { users, isLoading, error } = useUsersContext();

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Apellido
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Roles
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              users.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
