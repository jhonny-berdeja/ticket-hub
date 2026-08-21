export type TicketType = "ANSIBLE" | "DATABASE";

/** Allowlisted DATABASE target — fetched from `GET /tickets/db-targets`, never hardcoded (see infra design's "anti-drift" note). */
export interface DbTarget {
  namespace: string;
  deployment: string;
  dbName: string;
}

/** Internal ADMIN user — fetched from `GET /tickets/assignable-users`, feeds the "Asignar a" dropdown on both create forms. */
export interface AssignableUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

export interface TicketDetails {
  id: number;
  number: string;
  department: string;
  subject: string;
  status: "CREATED" | "APPROVED";
  description: string;
  ticketType: TicketType;
  codeAnsible: string | null;
  response: string | null;
  namespace: string | null;
  deployment: string | null;
  dbName: string | null;
  sqlCode: string | null;
}
