"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import UsersHeader from "@/app/home/users/components/users-header/UsersHeader";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";
import { isAdmin as checkIsAdmin } from "@/common/use-current-user/use-current-user.service";

const NOT_ADMIN_REDIRECT_PATH = "/home";

/**
 * Guard + fixed sub-header for the whole /home/users tree. Applies to
 * page.tsx, list/, create/, and [id]/edit/ automatically, since
 * they're all nested under this layout. Same redirect logic that used
 * to live in page.tsx before the Users section was split into routed
 * pages. UsersHeader stays visible across every one of those routes
 * instead of only on the landing page.
 */
export default function UsersLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status: authStatus, user } = useCurrentUser();
  const isAdmin = checkIsAdmin(user);

  useEffect(() => {
    if (authStatus !== "loading" && !isAdmin) {
      router.replace(NOT_ADMIN_REDIRECT_PATH);
    }
  }, [authStatus, isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <UsersHeader />
      {children}
    </>
  );
}
