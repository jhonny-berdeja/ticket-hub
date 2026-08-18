import type { CurrentUser } from "@/common/use-current-user/use-current-user.dto";

export const ADMIN_ROLE = "ADMIN";

/**
 * Pure rule over the current user, no React involved -- testable by
 * calling it directly with fixture values, no hook rendering needed.
 *
 * Take `user` only, not `status`: use-current-user.ts only ever sets a
 * non-null user together with status "authenticated" (see its .then
 * branch), and leaves user null on any other status. `user !== null`
 * is therefore already an exact stand-in for "authenticated".
 *
 * ADMIN is the only role left (DEV/APPROVER retired, see the backend's
 * own history) -- also used to gate ticket approval now, not just the
 * old ABMC Usuarios screen.
 */
export function isAdmin(user: CurrentUser | null): boolean {
  return user !== null && user.roles.includes(ADMIN_ROLE);
}
