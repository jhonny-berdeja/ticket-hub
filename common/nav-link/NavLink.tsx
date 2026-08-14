"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ACTIVE_CLASSNAME =
  "rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800";
const INACTIVE_CLASSNAME =
  "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

/**
 * Section-nav link shared by HomeHeader, UsersHeader, and
 * TicketsHeader: turns black (ACTIVE_CLASSNAME) when its href matches
 * the current route or is one of its sub-routes, so each header shows
 * which section/action is currently open. Exact match only for the
 * href's own path, not a fuzzy "related route" check -- e.g.
 * "/home/users/list" does not light up on "/home/users/42/edit".
 */
export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={isActive ? ACTIVE_CLASSNAME : INACTIVE_CLASSNAME}>
      {children}
    </Link>
  );
}
