import TicketsListView from "@/app/home/tickets/list/components/tickets-list-view/TicketsListView";

/**
 * Structure only, matching create/ansible's page.tsx: composes
 * TicketsListView filtered to KUBERNETES tickets.
 */
export default function KubernetesTicketsListPage() {
  return <TicketsListView ticketType="KUBERNETES" title="Tickets Kubernetes" />;
}
