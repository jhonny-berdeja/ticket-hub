"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ROLE_OPTIONS,
  type EditableUser,
  type Role,
} from "@/app/home/users/users.dto";
import {
  updateUserRequest,
  UpdateUserApiError,
} from "@/app/home/users/[id]/edit/components/edit-user-form/edit-user-form.api";

const MISSING_ROLE_MESSAGE = "Seleccioná al menos un rol.";
const GENERIC_ERROR_MESSAGE = "No se pudo editar el usuario. Intentá de nuevo.";
const USERS_LIST_PATH = "/home/users/list";

interface EditUserFormProps {
  user: EditableUser;
}

/**
 * Single component now -- no more EditUserForm/EditUserFormFields
 * split, since that split only existed to gate rendering on
 * modalState.type === "edit". [id]/edit/page.tsx now owns that
 * gating (loading/not-found/found), so this component can assume
 * `user` is always present. Takes `user` as its only prop (its
 * direct parent, [id]/edit/page.tsx, is the one that resolved it);
 * no onClose/onSave, this talks to the router directly.
 */
export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [lastname, setLastname] = useState(user.lastname);
  const [email, setEmail] = useState(user.email);
  const [roles, setRoles] = useState<Role[]>(user.roles);
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
      await updateUserRequest(user.id, { name, lastname, email, roles });
      router.push(USERS_LIST_PATH);
    } catch (submitError) {
      setError(
        submitError instanceof UpdateUserApiError
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
        Editar Usuario
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-user-name"
            className="text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            id="edit-user-name"
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
            htmlFor="edit-user-lastname"
            className="text-sm font-medium text-gray-700"
          >
            Apellido
          </label>
          <input
            id="edit-user-lastname"
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
            htmlFor="edit-user-email"
            className="text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="edit-user-email"
            type="email"
            required
            maxLength={30}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </>
  );
}
