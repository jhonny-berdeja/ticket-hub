"use client";

import { useEffect, useState } from "react";
import { fetchCurrentUser } from "@/common/use-current-user/use-current-user.api";
import type { CurrentUser, Status } from "@/common/use-current-user/use-current-user.dto";

/**
 * Fetches /api/me once on mount. Status starts "loading" on purpose so
 * callers gating ADMIN-only UI (the ABMC Usuarios button/page) can avoid
 * flashing it before the check resolves, instead of defaulting to
 * "not admin" and then popping the UI in a moment later.
 *
 * Only owns fetching + auth state. Role rules (isAdmin,
 * canApproveTickets) live in use-current-user.service and are called
 * directly by whichever consumer needs them (see layout.tsx, tickets
 * and users pages) -- keeps this hook single-purpose instead of
 * forcing every consumer to receive derived values it doesn't need.
 */
export function useCurrentUser(): { status: Status; user: CurrentUser | null } {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, user };
}
