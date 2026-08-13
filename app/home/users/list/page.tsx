"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">ABMC Usuarios</h1>
        <Link
          href="/home/users/create"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear Usuario
        </Link>
      </div>

      <UsersTable users={users} isLoading={isLoading} error={error} />
    </div>
  );
}
