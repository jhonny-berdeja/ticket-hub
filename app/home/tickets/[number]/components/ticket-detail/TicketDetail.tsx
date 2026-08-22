"use client";

import { useState } from "react";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";
import { isAdmin } from "@/common/use-current-user/use-current-user.service";
import { approveTicket } from "@/app/home/tickets/[number]/components/ticket-detail/ticket-detail.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const APPROVE_ERROR_MESSAGE = "No se pudo aprobar el ticket. Intentá de nuevo.";

interface TicketDetailProps {
  ticket: TicketDetails;
}

/**
 * Shows the ticket's full detail, adapted from the old
 * TicketDetailsModal: no more "fixed inset-0" wrapper or X close
 * button, this is a real page now, not a dialog. Takes `ticket` as
 * its only prop (its direct parent, [number]/page.tsx, already resolved
 * it), and seeds local state from it so a successful approve can
 * replace it with the updated ticket the backend returns (new
 * status, execution `response`, etc) -- the same page just
 * re-renders in place, no navigation, no page reload. Determines
 * canApprove for itself, same reasoning as before.
 */
export default function TicketDetail({ ticket: initialTicket }: TicketDetailProps) {
  const { user } = useCurrentUser();
  const canApprove = isAdmin(user);

  const [ticket, setTicket] = useState<TicketDetails>(initialTicket);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setError(null);
    setIsApproving(true);
    try {
      const updatedTicket = await approveTicket(ticket.ticketType, ticket.id);
      setTicket(updatedTicket);
    } catch {
      setError(APPROVE_ERROR_MESSAGE);
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        {ticket.number}
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">Estado: </span>
          {ticket.status}
        </div>
        <div>
          <span className="font-medium text-gray-700">Departamento: </span>
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
            <span className="font-medium text-gray-700">Código YAML:</span>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
              {ticket.codeAnsible}
            </pre>
          </div>
        )}
        {ticket.ticketType === "KUBERNETES" && ticket.executionType && (
          <div>
            <span className="font-medium text-gray-700">Tipo de ejecución: </span>
            {ticket.executionType}
          </div>
        )}
        {ticket.ticketType === "KUBERNETES" && ticket.codeYaml && (
          <div>
            <span className="font-medium text-gray-700">Código YAML:</span>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
              {ticket.codeYaml}
            </pre>
          </div>
        )}
        {ticket.ticketType === "DATABASE" && (
          <>
            <div>
              <span className="font-medium text-gray-700">Namespace: </span>
              {ticket.namespace}
            </div>
            <div>
              <span className="font-medium text-gray-700">Deployment: </span>
              {ticket.deployment}
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Base de datos:{" "}
              </span>
              {ticket.dbName}
            </div>
            <div>
              <span className="font-medium text-gray-700">SQL:</span>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
                {ticket.sqlCode}
              </pre>
            </div>
          </>
        )}
        {ticket.response && (
          <div>
            <span className="font-medium text-gray-700">
              Respuesta de la ejecución:
            </span>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
              {ticket.response}
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
    </>
  );
}
