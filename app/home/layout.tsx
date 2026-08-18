import { type ReactNode } from "react";
import HomeHeader from "@/app/home/components/home-header/HomeHeader";
import TicketsSidebar from "@/app/home/tickets/components/tickets-sidebar/TicketsSidebar";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <HomeHeader />

      <div className="flex flex-1">
        <TicketsSidebar />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
