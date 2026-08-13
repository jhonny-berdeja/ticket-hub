"use client";

import { useContext } from "react";
import {
  UsersContext,
  type UsersContextValue,
} from "@/app/home/users/components/users-context/users-context.context";

export function useUsersContext(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
}
