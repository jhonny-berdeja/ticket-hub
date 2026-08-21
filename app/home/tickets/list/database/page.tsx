import TicketsListView from "@/app/home/tickets/list/components/tickets-list-view/TicketsListView";

/**
 * Structure only, matching create/database's page.tsx: composes
 * TicketsListView filtered to DATABASE tickets.
 */
export default function DatabaseTicketsListPage() {
  return <TicketsListView ticketType="DATABASE" title="Tickets Base de Datos" />;
}
