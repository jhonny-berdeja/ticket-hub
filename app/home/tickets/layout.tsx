import { type ReactNode } from "react";
import TicketsSidebar from "@/app/home/tickets/components/tickets-sidebar/TicketsSidebar";

/**
 * No guard here (unlike users/layout.tsx) -- every authenticated user
 * can see tickets, there's no role restriction at this level (only the
 * approve action inside TicketDetail is role-gated). Just mounts the
 * fixed sub-nav so it stays visible across the landing, list, create,
 * and detail routes.
 */
export default function TicketsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <TicketsSidebar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
