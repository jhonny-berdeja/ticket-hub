"use client";

import { useState } from "react";
import CreateTicketForm from "@/components/CreateTicketForm";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Crear ticket
        </button>

        <button
          type="button"
          className="h-10 w-10 rounded-full bg-gray-300"
          aria-label="Perfil de usuario"
        />
      </header>

      <main className="flex flex-1 items-center justify-center">Ticket Hub</main>

      {isFormOpen && <CreateTicketForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
