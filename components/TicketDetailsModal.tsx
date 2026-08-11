import { useState } from "react";

export interface TicketDetails {
  id: number;
  number: string;
  department: string;
  subject: string;
  status: "CREATED" | "APPROVED";
  description: string;
  codeAnsible: string | null;
}

interface TicketDetailsModalProps {
  ticket: TicketDetails;
  canApprove: boolean;
  onClose: () => void;
  onApproved: () => void;
}

const APPROVE_ERROR_MESSAGE = "No se pudo aprobar el ticket. Intentá de nuevo.";

/** Shows a single ticket's full detail — used by the header search bar, and reusable anywhere else a ticket needs to be inspected. Approve button only shows when both canApprove and status is still CREATED. */
export default function TicketDetailsModal({
  ticket,
  canApprove,
  onClose,
  onApproved,
}: TicketDetailsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setError(null);
    setIsApproving(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/approve`, {
        method: "PATCH",
      });
      if (!response.ok) {
        setError(APPROVE_ERROR_MESSAGE);
        return;
      }
      onApproved();
    } catch {
      setError(APPROVE_ERROR_MESSAGE);
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {ticket.number}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Estado: </span>
            {ticket.status}
          </div>
          <div>
            <span className="font-medium text-gray-700">Datacenter: </span>
            {ticket.department}
          </div>
          <div>
            <span className="font-medium text-gray-700">Asunto: </span>
            {ticket.subject}
          </div>
          <div>
            <span className="font-medium text-gray-700">Descripción: </span>
            {ticket.description}
          </div>
          {ticket.codeAnsible && (
            <div>
              <span className="font-medium text-gray-700">
                Código YAML:
              </span>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
                {ticket.codeAnsible}
              </pre>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {canApprove && ticket.status === "CREATED" && (
          <button
            type="button"
            onClick={() => void handleApprove()}
            disabled={isApproving}
            className="mt-4 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {isApproving ? "Aprobando..." : "Aprobar"}
          </button>
        )}
      </div>
    </div>
  );
}
