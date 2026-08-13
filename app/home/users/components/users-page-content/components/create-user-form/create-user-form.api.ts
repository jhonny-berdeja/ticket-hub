import type {
  EditableUser,
  Role,
} from "@/app/home/users/components/users-context/users-context.dto";

const GENERIC_ERROR_MESSAGE = "No se pudo crear el usuario. Intentá de nuevo.";

interface CreateUserPayload {
  name: string;
  lastname: string;
  email: string;
  password: string;
  roles: Role[];
}

/** Thrown for a non-ok response, carrying the server's message (or the generic fallback). */
export class CreateUserApiError extends Error {}

/** Creates a user. Rejects with CreateUserApiError on a non-ok response; any other rejection means a network failure. */
export async function createUser(
  payload: CreateUserPayload,
): Promise<EditableUser> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new CreateUserApiError(await readErrorMessage(response));
  }

  const body: { data: EditableUser } = await response.json();
  return body.data;
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
