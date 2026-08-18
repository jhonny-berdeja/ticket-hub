"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/common/use-current-user/use-current-user";
import { isAdmin } from "@/common/use-current-user/use-current-user.service";
import { approveTicket } from "@/app/home/tickets/[id]/components/ticket-detail/ticket-detail.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

const APPROVE_ERROR_MESSAGE = "No se pudo aprobar el ticket. Intentá de nuevo.";
const TICKETS_LIST_PATH = "/home/tickets/list";

interface TicketDetailProps {
  ticket: TicketDetails;
}

/**
 * Shows the ticket's full detail, adapted from the old
 * TicketDetailsModal: no more "fixed inset-0" wrapper or X close
 * button, this is a real page now, not a dialog. Takes `ticket` as
 * its only prop (its direct parent, [id]/page.tsx, already resolved
 * it). Determines canApprove for itself, same reasoning as before.
 * On successful approve, navigates back to the list instead of
 * relying on a reactive lastApprovedTicket refetch trick -- there's
 * no sibling list mounted at the same time to react to anymore.
 */
export default function TicketDetail({ ticket }: TicketDetailProps) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const canApprove = isAdmin(user);

  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  async function handleApprove() {
    setError(null);
    setIsApproving(true);
    try {
      await approveTicket(ticket.id);
      router.push(TICKETS_LIST_PATH);
    } catch {
      setError(APPROVE_ERROR_MESSAGE);
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
            <span className="font-medium text-gray-700">Código YAML:</span>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700">
              {ticket.codeAnsible}
            </pre>
          </div>
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
