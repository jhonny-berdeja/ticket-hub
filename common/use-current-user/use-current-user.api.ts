import type { CurrentUser } from "@/common/use-current-user/use-current-user.dto";

/** Fetches the signed-in user from /api/me. Throws when unauthenticated or on network failure. */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetch("/api/me");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  const body: { data: CurrentUser } = await response.json();
  return body.data;
}
