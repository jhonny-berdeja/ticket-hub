"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createTicket,
  CreateTicketApiError,
} from "@/app/home/tickets/create/ansible/components/create-ansible-ticket-form/create-ansible-ticket-form.api";
import { fetchAssignableUsers } from "@/app/home/tickets/tickets.api";
import type { AssignableUser } from "@/app/home/tickets/tickets.dto";

const FIXED_DEPARTMENT = "Centro de datos";
const NO_ASSIGNEE_MESSAGE = "Ingresá a quién asignar el ticket.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";
const TICKETS_LIST_PATH = "/home/tickets/list";

/**
 * No Context: this is a real page now, not a modal. On successful
 * create there's no onCreated to call -- the list re-fetches on its
 * own when we navigate back to it, so this just pushes the route.
 * "Cancelar" does the same navigation, taking over the job the old X
 * close button used to do.
 *
 * `assignee` is a dropdown fed by `GET /tickets/assignable-users`
 * (internal ADMIN users on ticket-hub) -- the submitted value is the
 * selected user's email, which lands in the still free-text `assignee`
 * VARCHAR(100) column (no FK). See `tickets.api.ts` for the shared
 * fetch, promoted there since CreateDatabaseTicketForm needs the same
 * list.
 *
 * Dedicated ANSIBLE-only form: always submits `ticketType: "ANSIBLE"`,
 * no type selector. See CreateDatabaseTicketForm for the DATABASE
 * counterpart -- they used to be one form with a branch, split so each
 * route only carries the fields it actually needs.
 */
export default function CreateAnsibleTicketForm() {
  const router = useRouter();

  const [assignee, setAssignee] = useState("");
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>(
    [],
  );
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [codeAnsible, setCodeAnsible] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAssignableUsers()
      .then((users) => {
        if (cancelled) return;
        setAssignableUsers(users);
      })
      .catch(() => {
        // Non-fatal: submit still surfaces its own "no assignee"
        // validation error if the dropdown ends up empty.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (assignee.trim() === "") {
      setError(NO_ASSIGNEE_MESSAGE);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await createTicket({
        assignee,
        department: FIXED_DEPARTMENT,
        subject,
        description,
        ticketType: "ANSIBLE",
        codeAnsible: codeAnsible === "" ? undefined : codeAnsible,
      });

      router.push(TICKETS_LIST_PATH);
    } catch (submitError) {
      setError(
        submitError instanceof CreateTicketApiError
          ? submitError.message
          : GENERIC_ERROR_MESSAGE,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Datacenter
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datacenter"
            className="text-sm font-medium text-gray-700"
          >
            Departamento
          </label>
          <input
            id="datacenter"
            type="text"
            value={FIXED_DEPARTMENT}
            disabled
            className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="assignee"
            className="text-sm font-medium text-gray-700"
          >
            Asignar a
          </label>
          <select
            id="assignee"
            required
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="">Seleccioná a quién asignar</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} {user.lastname} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="asunto"
            className="text-sm font-medium text-gray-700"
          >
            Asunto
          </label>
          <input
            id="asunto"
            type="text"
            required
            maxLength={100}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Asunto del ticket"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="descripcion"
            className="text-sm font-medium text-gray-700"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            rows={3}
            required
            maxLength={200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describí el problema o la solicitud"
            className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="yaml" className="text-sm font-medium text-gray-700">
            Código YAML
          </label>
          <textarea
            id="yaml"
            rows={6}
            maxLength={500}
            value={codeAnsible}
            onChange={(event) => setCodeAnsible(event.target.value)}
            placeholder={"clave: valor\notra_clave: otro_valor"}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(TICKETS_LIST_PATH)}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear ticket centro de datos"}
          </button>
        </div>
      </form>
    </>
  );
}
