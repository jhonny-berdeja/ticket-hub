import { useUsersContext } from "@/app/home/users/components/users-context/use-users-context";
import UsersTable from "@/app/home/users/components/users-page-content/components/users-table/UsersTable";
import CreateUserForm from "@/app/home/users/components/users-page-content/components/create-user-form/CreateUserForm";
import EditUserForm from "@/app/home/users/components/users-page-content/components/edit-user-form/EditUserForm";

/**
 * Structure and component orchestration only: layout, the "Crear
 * Usuario" button, and mounting the table + both forms. No fetching,
 * no user list state, no knowledge of which form is open -- all of
 * that lives in UsersContext, read directly by whichever component
 * needs it. Must render inside a UsersProvider (see UsersPage).
 */
export default function UsersPageContent() {
  const { openCreate } = useUsersContext();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          ABMC Usuarios
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear Usuario
        </button>
      </div>

      <UsersTable />

      <CreateUserForm />
      <EditUserForm />
    </div>
  );
}
