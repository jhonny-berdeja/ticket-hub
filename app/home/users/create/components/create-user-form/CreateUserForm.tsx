"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROLE_OPTIONS, type Role } from "@/app/home/users/users.dto";
import {
  createUser,
  CreateUserApiError,
} from "@/app/home/users/create/components/create-user-form/create-user-form.api";

const MISSING_ROLE_MESSAGE = "Seleccioná al menos un rol.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el usuario. Intentá de nuevo.";
const USERS_LIST_PATH = "/home/users/list";

/**
 * No Context: this is a real page now, not a modal coordinated
 * through UsersActions. On successful create there's no addUser to
 * call -- the list re-fetches on its own when we navigate back to
 * it, so the only thing this component does is push the route.
 * "Cancelar" does the same navigation, taking over the job the old X
 * close button used to do.
 */
export default function CreateUserForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleRole(role: Role) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((selected) => selected !== role)
        : [...current, role],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (roles.length === 0) {
      setError(MISSING_ROLE_MESSAGE);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await createUser({ name, lastname, email, password, roles });
      router.push(USERS_LIST_PATH);
    } catch (submitError) {
      setError(
        submitError instanceof CreateUserApiError
          ? submitError.message
          : GENERIC_ERROR_MESSAGE,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Crear Usuario
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="create-user-name"
            className="text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            id="create-user-name"
            type="text"
            required
            maxLength={15}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="create-user-lastname"
            className="text-sm font-medium text-gray-700"
          >
            Apellido
          </label>
          <input
            id="create-user-lastname"
            type="text"
            required
            maxLength={15}
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="create-user-email"
            className="text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="create-user-email"
            type="email"
            required
            maxLength={30}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="create-user-password"
            className="text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            id="create-user-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-gray-700">
            Roles
          </legend>
          <div className="flex flex-wrap gap-3">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(USERS_LIST_PATH)}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </>
  );
}
