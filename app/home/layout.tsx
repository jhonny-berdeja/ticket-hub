"use client";

import { type ReactNode } from "react";
import HomeHeader from "@/app/home/components/home-header/HomeHeader";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";

const ADMIN_ROLE = "ADMIN";
const APPROVER_ROLE = "APPROVER";

/**
 * Shared chrome for every page under /home: the header (ABMC Tickets,
 * ABMC Usuarios, ticket search, Cerrar sesión, avatar) stays visible
 * while only the page content below it changes - /home, /home/tickets
 * and /home/users all render through here via `children`. ABMC
 * Tickets has no role gate (every role has some form of ticket access);
 * ABMC Usuarios is ADMIN-only. "Crear ticket" lives in
 * app/home/tickets/page.tsx, alongside the ticket list it needs to
 * refresh after a create - it doesn't make sense floating over
 * /home/users.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useCurrentUser();
  const isAdmin =
    authStatus === "authenticated" &&
    user !== null &&
    user.roles.includes(ADMIN_ROLE);
  const canApproveTickets =
    authStatus === "authenticated" &&
    user !== null &&
    (user.roles.includes(ADMIN_ROLE) || user.roles.includes(APPROVER_ROLE));

  return (
    <div className="flex min-h-full flex-col">
      <HomeHeader isAdmin={isAdmin} canApproveTickets={canApproveTickets} />

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
