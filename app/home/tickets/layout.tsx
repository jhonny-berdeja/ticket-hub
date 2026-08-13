import { type ReactNode } from "react";
import TicketsHeader from "@/app/home/tickets/components/tickets-header/TicketsHeader";

/**
 * No guard here (unlike users/layout.tsx) -- every authenticated user
 * can see tickets, there's no role restriction at this level (only the
 * approve action inside TicketDetail is role-gated). Just mounts the
 * fixed sub-header so it stays visible across the landing, list,
 * create, and detail routes.
 */
export default function TicketsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TicketsHeader />
      {children}
    </>
  );
}
