"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersProvider } from "@/app/home/users/components/users-context/users-context.provider";
import UsersPageContent from "@/app/home/users/components/users-page-content/UsersPageContent";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";

const ADMIN_ROLE = "ADMIN";
const NOT_ADMIN_REDIRECT_PATH = "/home";

export default function UsersPage() {
  const router = useRouter();
  const { status: authStatus, user } = useCurrentUser();
  const isAdmin =
    authStatus === "authenticated" &&
    user !== null &&
    user.roles.includes(ADMIN_ROLE);

  // Defense in depth against direct URL navigation: the ABMC Usuarios
  // link is already hidden for non-admins in the layout, but this page
  // must not render its content for anyone who types the URL directly.
  // Nothing renders below (see the early return) until this resolves.
  useEffect(() => {
    if (authStatus !== "loading" && !isAdmin) {
      router.replace(NOT_ADMIN_REDIRECT_PATH);
    }
  }, [authStatus, isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <UsersProvider enabled={isAdmin}>
      <UsersPageContent />
    </UsersProvider>
  );
}
