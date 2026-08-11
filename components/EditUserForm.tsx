import { useState, type FormEvent } from "react";

const ROLE_OPTIONS = ["ADMIN", "DEV", "APPROVER"] as const;
type Role = (typeof ROLE_OPTIONS)[number];

const MISSING_ROLE_MESSAGE = "Seleccioná al menos un rol.";
const GENERIC_ERROR_MESSAGE = "No se pudo editar el usuario. Intentá de nuevo.";

export interface EditableUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  roles: Role[];
}

interface EditUserFormProps {
  user: EditableUser;
  onClose: () => void;
  onUpdated: () => void;
}

/**
 * Independent from CreateUserForm on purpose (separate product decision):
 * no password field - that's a different flow - and every field starts
 * pre-filled from the user being edited instead of empty.
 */
export default function EditUserForm({
  user,
  onClose,
  onUpdated,
}: EditUserFormProps) {
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
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastname, email, roles }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      onUpdated();
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
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

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return GENERIC_ERROR_MESSAGE;
}
