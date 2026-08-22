import CreateKubernetesTicketForm from "@/app/home/tickets/create/kubernetes/components/create-kubernetes-ticket-form/CreateKubernetesTicketForm";

/**
 * Structure only: a normal page container + card, matching
 * create/ansible's page.tsx. CreateKubernetesTicketForm renders the
 * form itself, this page just owns the outer layout.
 */
export default function CreateKubernetesTicketPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6">
        <CreateKubernetesTicketForm />
      </div>
    </div>
  );
}
