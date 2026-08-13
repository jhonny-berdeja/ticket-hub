"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import EditUserForm from "@/app/home/users/[id]/edit/components/edit-user-form/EditUserForm";
import { fetchUsers } from "@/app/home/users/users.api";
import type { EditableUser } from "@/app/home/users/users.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de usuarios.";
const USERS_LIST_PATH = "/home/users/list";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Client component, so `params` (a Promise in Next.js 16 App
 * Router) is unwrapped with React's `use()`. There's no GET-by-id
 * endpoint, so this fetches the full list via the shared
 * users.api's fetchUsers() -- same as the list page -- and finds
 * the matching user client-side by the route's `id` param. Three
 * render states: loading, load failure, not found (id doesn't match
 * any user), and found.
 */
export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params);

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

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const user = users.find((candidate) => candidate.id === Number(id));

  if (!user) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <p className="text-sm text-gray-500">Usuario no encontrado.</p>
        <Link
          href={USERS_LIST_PATH}
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6">
        <EditUserForm key={id} user={user} />
      </div>
    </div>
  );
}
