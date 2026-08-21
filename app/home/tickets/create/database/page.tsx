import CreateDatabaseTicketForm from "@/app/home/tickets/create/database/components/create-database-ticket-form/CreateDatabaseTicketForm";

/**
 * Structure only: a normal page container + card, matching the
 * non-modal look of Users' create page. CreateDatabaseTicketForm no
 * longer renders its own overlay wrapper -- this page owns the outer
 * layout now that it's a real route, not a dialog.
 */
export default function CreateDatabaseTicketPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6">
        <CreateDatabaseTicketForm />
      </div>
    </div>
  );
}
