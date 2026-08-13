import { type ReactNode } from "react";
import HomeHeader from "@/app/home/components/home-header/HomeHeader";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <HomeHeader />

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
