"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createTicket,
  CreateTicketApiError,
} from "@/app/home/tickets/create/kubernetes/components/create-kubernetes-ticket-form/create-kubernetes-ticket-form.api";
import { fetchAssignableUsers } from "@/app/home/tickets/tickets.api";
import type {
  AssignableUser,
  KubernetesExecutionType,
} from "@/app/home/tickets/tickets.dto";

const FIXED_DEPARTMENT = "Kubernetes";
const NO_ASSIGNEE_MESSAGE = "Ingresá a quién asignar el ticket.";
const NO_EXECUTION_TYPE_MESSAGE = "Seleccioná el tipo de ejecución.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";
const KUBERNETES_TICKETS_LIST_PATH = "/home/tickets/list/kubernetes";

/**
 * No Context: this is a real page now, not a modal. On successful
 * create there's no onCreated to call -- instead we push straight to
 * the created ticket's own detail page so the user can see how it
 * came out. "Cancelar" goes back to this form's own list
 * (`/home/tickets/list/kubernetes`), taking over the job the old X
 * close button used to do.
 *
 * `assignee` is a dropdown fed by `GET /tickets/assignable-users`
 * (internal ADMIN users on ticket-hub) -- the submitted value is the
 * selected user's email, which lands in the still free-text `assignee`
 * VARCHAR(100) column (no FK). See `tickets.api.ts` for the shared
 * fetch, promoted there since CreateAnsibleTicketForm/
 * CreateDatabaseTicketForm need the same list.
 *
 * Dedicated KUBERNETES-only form: posts to /api/tickets/kubernetes, no
 * ticket-type selector (that's fixed by the route). Mirrors
 * CreateAnsibleTicketForm field-for-field -- same fixed Departamento
 * pattern, same Asignar a/Asunto/Descripción fields -- but the YAML
 * field lands in the dedicated `codeYaml` column instead of
 * `codeAnsible`.
 *
 * `executionType` ("Tipo de ejecución") is KUBERNETES-specific: it
 * tells the backend whether `codeYaml` should be run as an Ansible
 * playbook or applied as a raw manifest. Static two-option select (no
 * fetch needed, the enum is fixed) -- required with an empty default,
 * validated the same way as `assignee` before submit, since this
 * choice changes how the backend executes the ticket and shouldn't be
 * silently defaulted.
 */
export default function CreateKubernetesTicketForm() {
  const router = useRouter();

  const [assignee, setAssignee] = useState("");
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>(
    [],
  );
  const [executionType, setExecutionType] = useState<
    KubernetesExecutionType | ""
  >("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [codeYaml, setCodeYaml] = useState("");
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

    if (executionType === "") {
      setError(NO_EXECUTION_TYPE_MESSAGE);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const createdTicket = await createTicket({
        assignee,
        department: FIXED_DEPARTMENT,
        executionType,
        subject,
        description,
        codeYaml: codeYaml === "" ? undefined : codeYaml,
      });

      router.push(`/home/tickets/${createdTicket.number}`);
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
        Kubernetes
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
            htmlFor="execution-type"
            className="text-sm font-medium text-gray-700"
          >
            Tipo de ejecución
          </label>
          <select
            id="execution-type"
            required
            value={executionType}
            onChange={(event) =>
              setExecutionType(
                event.target.value as KubernetesExecutionType,
              )
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="">Seleccioná el tipo de ejecución</option>
            <option value="ANSIBLE">Ansible</option>
            <option value="MANIFEST">Manifest</option>
          </select>
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
            {executionType === "ANSIBLE" ? "Playbook Ansible" : "Código YAML"}
          </label>
          <textarea
            id="yaml"
            rows={6}
            maxLength={500}
            value={codeYaml}
            onChange={(event) => setCodeYaml(event.target.value)}
            placeholder={
              executionType === "ANSIBLE"
                ? "- hosts: all\n  tasks:\n    - name: ..."
                : "clave: valor\notra_clave: otro_valor"
            }
            className="resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(KUBERNETES_TICKETS_LIST_PATH)}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear ticket kubernetes"}
          </button>
        </div>
      </form>
    </>
  );
}
