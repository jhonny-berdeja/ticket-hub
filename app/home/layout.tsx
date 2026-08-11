"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateTicketForm from "@/components/CreateTicketForm";

/**
 * Shared chrome for every page under /home: the header (Crear ticket,
 * ABMC Usuarios, Cerrar sesión, avatar) stays visible while only the
 * page content below it changes - /home and /home/usuarios both render
 * through here via `children`.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // No error handling on the fetch: even if it fails, the cookie can't
  // be cleared client-side (httpOnly), so redirecting to /login
  // regardless still gets the user out of any protected page - the
  // proxy bounces back here again if the cookie somehow survived.
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Crear ticket
          </button>

          <Link
            href="/home/usuarios"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ABMC Usuarios
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cerrar sesión
          </button>

          <button
            type="button"
            className="h-10 w-10 rounded-full bg-gray-300"
            aria-label="Perfil de usuario"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {isFormOpen && <CreateTicketForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
