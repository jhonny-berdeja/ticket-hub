"use client";

import { useEffect, useState } from "react";
import UsersTable from "@/app/home/users/list/components/users-table/UsersTable";
import { fetchUsers } from "@/app/home/users/users.api";
import type { EditableUser } from "@/app/home/users/users.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de usuarios.";

/**
 * Self-contained, like TicketsPageContent: fetches the user list
 * itself and re-fetches on every mount, i.e. every navigation back
 * here after a create/edit -- no cross-page state to coordinate
 * anymore.
 */
export default function UsersListPage() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchUsers()
      .then((loadedUsers) => {
        if (cancelled) return;
        setUsers(loadedUsers);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(LOAD_ERROR_MESSAGE);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Usuarios</h1>

      <UsersTable users={users} isLoading={isLoading} error={error} />
    </div>
  );
}
