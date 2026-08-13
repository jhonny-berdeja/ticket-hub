import { useEffect, useState, type FormEvent } from "react";
import {
  fetchApprovers,
  createTicket,
  CreateTicketApiError,
} from "@/app/home/tickets/components/tickets-page-content/components/create-ticket-form/create-ticket-form.api";
import type { Approver } from "@/app/home/tickets/components/tickets-page-content/components/create-ticket-form/create-ticket-form.dto";

const FIXED_DEPARTMENT = "Datacenter";
const NO_ASSIGNEE_MESSAGE = "Seleccioná a quién asignar el ticket.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el ticket. Intentá de nuevo.";

interface CreateTicketFormProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTicketForm({
  onClose,
  onCreated,
}: CreateTicketFormProps) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [assignee, setAssignee] = useState<number | "">("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [codeAnsible, setCodeAnsible] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchApprovers()
      .then((loadedApprovers) => {
        if (!cancelled) {
          setApprovers(loadedApprovers);
        }
      })
      .catch(() => {
        // Leaves approvers empty - the select just shows no options, the
        // form's own "seleccioná a quién asignar" validation still fires.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (assignee === "") {
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
        codeAnsible: codeAnsible === "" ? undefined : codeAnsible,
      });

      onCreated();
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Crear ticket</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

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
              htmlFor="assignee"
              className="text-sm font-medium text-gray-700"
            >
              Asignar a
            </label>
            <select
              id="assignee"
              required
              value={assignee}
              onChange={(event) =>
                setAssignee(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">Seleccioná un approver o admin</option>
              {approvers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.name} {approver.lastname} ({approver.email})
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
