import type { CurrentUser } from "@/common/use-current-user/use-current-user.dto";

export const ADMIN_ROLE = "ADMIN";
export const APPROVER_ROLE = "APPROVER";

/**
 * Pure rules over the current user, no React involved -- testable by
 * calling them directly with fixture values, no hook rendering needed.
 *
 * Take `user` only, not `status`: use-current-user.ts only ever sets a
 * non-null user together with status "authenticated" (see its .then
 * branch), and leaves user null on any other status. `user !== null`
 * is therefore already an exact stand-in for "authenticated".
 */

export function isAdmin(user: CurrentUser | null): boolean {
  return user !== null && user.roles.includes(ADMIN_ROLE);
}

export function canApproveTickets(user: CurrentUser | null): boolean {
  return (
    user !== null &&
    (user.roles.includes(ADMIN_ROLE) || user.roles.includes(APPROVER_ROLE))
  );
}
