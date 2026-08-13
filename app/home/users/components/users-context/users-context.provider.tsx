"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  UsersContext,
  type UsersContextValue,
} from "@/app/home/users/components/users-context/users-context.context";
import { fetchUsers } from "@/app/home/users/components/users-context/users-context.api";
import type { EditableUser } from "@/app/home/users/components/users-context/users-context.dto";

const LOAD_ERROR_MESSAGE = "No se pudo cargar la lista de usuarios.";

interface UsersProviderProps {
  enabled: boolean;
  children: ReactNode;
}

/**
 * Owns every piece of state the /home/users tree needs to
 * coordinate, so no component passes data back up to a parent by
 * prop -- every component that needs to read or write this state
 * calls useUsersContext() directly, no matter how deep it's nested
 * (see UserRow, EditUserForm, CreateUserForm). Parent-to-child props
 * are still normal (UsersTable -> UserRow still gets `user` by prop);
 * only child-to-parent data flow moves through here instead.
 *
 * `enabled` gates the initial fetch: false while auth is still
 * resolving or the signed-in user isn't an admin, so this never
 * fetches the user list for someone who shouldn't see it.
 */
export function UsersProvider({ enabled, children }: UsersProviderProps) {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    fetchUsers()
      .then((loadedUsers) => {
        if (cancelled) return;
        setUsers(loadedUsers);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(LOAD_ERROR_MESSAGE);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);
  const openEdit = useCallback(
    (user: EditableUser) => setEditingUser(user),
    [],
  );
  const closeEdit = useCallback(() => setEditingUser(null), []);

  const addUser = useCallback((user: EditableUser) => {
    setUsers((current) => [...current, user]);
    setIsCreateOpen(false);
  }, []);

  const updateUser = useCallback((user: EditableUser) => {
    setUsers((current) =>
      current.map((existing) => (existing.id === user.id ? user : existing)),
    );
    setEditingUser(null);
  }, []);

  const value: UsersContextValue = {
    users,
    isLoading,
    error,
    isCreateOpen,
    editingUser,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    addUser,
    updateUser,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}
