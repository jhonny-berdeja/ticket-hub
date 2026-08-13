"use client";

import { createContext } from "react";
import type { EditableUser } from "@/app/home/users/components/users-context/users-context.dto";

export interface UsersContextValue {
  users: EditableUser[];
  isLoading: boolean;
  error: string | null;
  isCreateOpen: boolean;
  editingUser: EditableUser | null;
  openCreate: () => void;
  closeCreate: () => void;
  openEdit: (user: EditableUser) => void;
  closeEdit: () => void;
  addUser: (user: EditableUser) => void;
  updateUser: (user: EditableUser) => void;
}

export const UsersContext = createContext<UsersContextValue | null>(null);
