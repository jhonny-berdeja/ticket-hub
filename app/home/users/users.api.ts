import type { EditableUser } from "@/app/home/users/users.dto";

/** Fetches the full user list. Throws on a non-ok response or network failure. */
export async function fetchUsers(): Promise<EditableUser[]> {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Failed to load users");
  }
  const body: { data: EditableUser[] } = await response.json();
  return body.data;
}
