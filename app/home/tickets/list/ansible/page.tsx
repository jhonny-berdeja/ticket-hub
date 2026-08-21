import TicketsListView from "@/app/home/tickets/list/components/tickets-list-view/TicketsListView";

/**
 * Structure only, matching create/ansible's page.tsx: composes
 * TicketsListView filtered to ANSIBLE (datacenter) tickets.
 */
export default function AnsibleTicketsListPage() {
  return <TicketsListView ticketType="ANSIBLE" title="Tickets Centro de Datos" />;
}
