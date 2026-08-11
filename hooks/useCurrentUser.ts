"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  sub: number;
  email: string;
  roles: string[];
}

type Status = "loading" | "authenticated" | "unauthenticated";

/**
 * Fetches /api/me once on mount. Status starts "loading" on purpose so
 * callers gating ADMIN-only UI (the ABMC Usuarios button/page) can avoid
 * flashing it before the check resolves, instead of defaulting to
 * "not admin" and then popping the UI in a moment later.
 */
export function useCurrentUser(): { status: Status; user: CurrentUser | null } {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me")
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setStatus("unauthenticated");
          return;
        }
        return response.json().then((body: { data: CurrentUser }) => {
          if (cancelled) return;
          setUser(body.data);
          setStatus("authenticated");
        });
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
