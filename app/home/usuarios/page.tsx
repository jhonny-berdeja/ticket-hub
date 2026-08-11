"use client";

import { useEffect, useState } from "react";
import CreateUserForm from "@/components/CreateUserForm";
import EditUserForm, { type EditableUser } from "@/components/EditUserForm";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de usuarios.";

export default function UsuariosPage() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  // Bumped by handleCreated/handleUpdated to ask the effect below to
  // refetch - the effect is the only place that fetches and sets
  // users/error/isLoading, driven purely by this dependency changing,
  // not by anything calling an async loader function directly
  // (react-hooks/set-state-in-effect flags that shape even when the
  // setState calls themselves are after an await).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/users")
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setError(LOAD_ERROR_MESSAGE);
          setIsLoading(false);
          return;
        }
        return response.json().then((body: { data: EditableUser[] }) => {
          if (cancelled) return;
          setUsers(body.data);
          setIsLoading(false);
        });
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
  }, [refreshKey]);

  function handleCreated() {
    setIsCreateOpen(false);
    setIsLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }

  function handleUpdated() {
    setEditingUser(null);
    setIsLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          ABMC Usuarios
        </h1>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear Usuario
        </button>
      </div>

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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-900">{user.lastname}</td>
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {user.roles.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      aria-label={`Editar ${user.email}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <CreateUserForm
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
