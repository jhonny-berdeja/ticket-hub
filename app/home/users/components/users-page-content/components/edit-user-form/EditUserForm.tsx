import { useState, type FormEvent } from "react";
import { useUsersContext } from "@/app/home/users/components/users-context/use-users-context";
import {
  ROLE_OPTIONS,
  type EditableUser,
  type Role,
} from "@/app/home/users/components/users-context/users-context.dto";
import {
  updateUserRequest,
  UpdateUserApiError,
} from "@/app/home/users/components/users-page-content/components/edit-user-form/edit-user-form.api";

const MISSING_ROLE_MESSAGE = "Seleccioná al menos un rol.";
const GENERIC_ERROR_MESSAGE = "No se pudo editar el usuario. Intentá de nuevo.";

/**
 * Independent from CreateUserForm on purpose (separate product decision):
 * no password field - that's a different flow - and every field starts
 * pre-filled from the user being edited instead of empty.
 *
 * Reads editingUser/closeEdit/updateUser from UsersContext instead of
 * receiving user/onClose/onUpdated as props -- the edited user goes
 * straight into the context, never back up to UsersPage by
 * parameter. Field state is seeded from context.editingUser once,
 * when this stops being null (see the key on the parent's usage).
 */
export default function EditUserForm() {
  const { editingUser, closeEdit, updateUser } = useUsersContext();

  if (!editingUser) {
    return null;
  }

  return (
    <EditUserFormFields
      // Forces a remount if editingUser ever changes to a *different*
      // user while already open, so field state reseeds instead of
      // carrying over stale values from the previous edit session.
      key={editingUser.id}
      user={editingUser}
      onClose={closeEdit}
      onSave={updateUser}
    />
  );
}

interface EditUserFormFieldsProps {
  user: EditableUser;
  onClose: () => void;
  onSave: (user: EditableUser) => void;
}

/**
 * Split from EditUserForm so field state can seed from `user` exactly
 * once per edit session (mounted fresh each time context.editingUser
 * goes from null to a user, via the `key` on the parent's usage) --
 * `user` itself is still a normal parent-to-child prop, only passed
 * one component down from EditUserForm's own context read.
 */
function EditUserFormFields({ user, onClose, onSave }: EditUserFormFieldsProps) {
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
      const updated = await updateUserRequest(user.id, {
        name,
        lastname,
        email,
        roles,
      });
      onSave(updated);
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Editar Usuario
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}
