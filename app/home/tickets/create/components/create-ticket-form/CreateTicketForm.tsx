"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createTicket,
  fetchDbTargets,
  CreateTicketApiError,
} from "@/app/home/tickets/create/components/create-ticket-form/create-ticket-form.api";
import type {
  DbTarget,
  OperationType,
  TicketType,
} from "@/app/home/tickets/tickets.dto";

const FIXED_DEPARTMENT = "Datacenter";
const NO_ASSIGNEE_MESSAGE = "Ingresá a quién asignar el ticket.";
const NO_DB_TARGET_MESSAGE = "Seleccioná una base de datos.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";
const TICKETS_LIST_PATH = "/home/tickets/list";

/**
 * No Context: this is a real page now, not a modal. On successful
 * create there's no onCreated to call -- the list re-fetches on its
 * own when we navigate back to it, so this just pushes the route.
 * "Cancelar" does the same navigation, taking over the job the old X
 * close button used to do.
 *
 * `assignee` is a free-text input now, not a dropdown fed by a users
 * list -- there's no local users/roles data left to pick from
 * (ticket-hub-api's own users/roles tables are gone, see its history).
 *
 * `ticketType` adds a second branch (DATABASE): the db-targets
 * dropdown is fed from `GET /tickets/db-targets`, never hardcoded
 * here -- pcbox-api's allowlist stays the single source of truth (see
 * the manage-database-sql-ticket design's "anti-drift" note).
 */
export default function CreateTicketForm() {
  const router = useRouter();

  const [assignee, setAssignee] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [ticketType, setTicketType] = useState<TicketType>("ANSIBLE");
  const [codeAnsible, setCodeAnsible] = useState("");
  const [dbTargets, setDbTargets] = useState<DbTarget[]>([]);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState("");
  const [operationType, setOperationType] =
    useState<OperationType>("LECTURA");
  const [sqlCode, setSqlCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDbTargets()
      .then((targets) => {
        if (cancelled) return;
        setDbTargets(targets);
      })
      .catch(() => {
        // Non-fatal: the ANSIBLE path doesn't need this list at all, and
        // the DATABASE path surfaces its own "no db-targets" validation
        // error on submit if the dropdown ends up empty.
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

    const selectedTarget = dbTargets[Number(selectedTargetIndex)];
    if (ticketType === "DATABASE" && !selectedTarget) {
      setError(NO_DB_TARGET_MESSAGE);
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
        ticketType,
        ...(ticketType === "DATABASE"
          ? {
              namespace: selectedTarget!.namespace,
              deployment: selectedTarget!.deployment,
              dbName: selectedTarget!.dbName,
              operationType,
              sqlCode,
            }
          : {
              codeAnsible: codeAnsible === "" ? undefined : codeAnsible,
            }),
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
        Crear ticket
      </h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datacenter"
            className="text-sm font-medium text-gray-700"
          >
            Datacenter
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
            htmlFor="tipo-ticket"
            className="text-sm font-medium text-gray-700"
          >
            Tipo de ticket
          </label>
          <select
            id="tipo-ticket"
            value={ticketType}
            onChange={(event) =>
              setTicketType(event.target.value as TicketType)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="ANSIBLE">Ansible</option>
            <option value="DATABASE">Base de datos</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="assignee"
            className="text-sm font-medium text-gray-700"
          >
            Asignar a
          </label>
          <input
            id="assignee"
            type="text"
            required
            maxLength={100}
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            placeholder="Nombre de quien lo va a aprobar"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
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

        {ticketType === "ANSIBLE" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="yaml"
              className="text-sm font-medium text-gray-700"
            >
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
        )}

        {ticketType === "DATABASE" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="base-de-datos"
                className="text-sm font-medium text-gray-700"
              >
                Base de datos
              </label>
              <select
                id="base-de-datos"
                required
                value={selectedTargetIndex}
                onChange={(event) =>
                  setSelectedTargetIndex(event.target.value)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Seleccioná una base de datos</option>
                {dbTargets.map((target, index) => (
                  <option key={target.dbName} value={index}>
                    {target.dbName} ({target.namespace}/{target.deployment})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="tipo-operacion"
                className="text-sm font-medium text-gray-700"
              >
                Tipo de operación
              </label>
              <select
                id="tipo-operacion"
                value={operationType}
                onChange={(event) =>
                  setOperationType(event.target.value as OperationType)
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              >
                <option value="LECTURA">Lectura</option>
                <option value="ESCRITURA">Escritura</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="sql"
                className="text-sm font-medium text-gray-700"
              >
                SQL
              </label>
              <textarea
                id="sql"
                rows={6}
                required
                maxLength={5000}
                value={sqlCode}
                onChange={(event) => setSqlCode(event.target.value)}
                placeholder="SELECT 1;"
                className="resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </>
        )}

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
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </>
  );
}
