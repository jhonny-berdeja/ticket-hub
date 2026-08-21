import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TicketDetail from "./TicketDetail";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/common/use-current-user/use-current-user", () => ({
  useCurrentUser: () => ({ user: { apps: { application: { roles: [] } } } }),
}));

vi.mock("@/common/use-current-user/use-current-user.service", () => ({
  isAdmin: () => false,
}));

const DATABASE_TICKET: TicketDetails = {
  id: 1,
  number: "TK-1",
  department: "Base de datos",
  subject: "Read a row",
  status: "CREATED",
  description: "Need to read one row",
  ticketType: "DATABASE",
  codeAnsible: null,
  response: null,
  namespace: "pcbox-api",
  deployment: "pcbox-db-deploy",
  dbName: "pcbox-db",
  sqlCode: "SELECT * FROM users;",
};

describe("TicketDetail — DATABASE ticketType", () => {
  it("renders all 4 DATABASE fields verbatim before any approve action", () => {
    render(<TicketDetail ticket={DATABASE_TICKET} />);

    expect(screen.getByText("pcbox-api")).toBeInTheDocument();
    expect(screen.getByText("pcbox-db-deploy")).toBeInTheDocument();
    expect(screen.getByText("pcbox-db")).toBeInTheDocument();
    expect(screen.getByText("SELECT * FROM users;")).toBeInTheDocument();
  });

  it("still renders the YAML block for an ANSIBLE ticket, and no DATABASE fields", () => {
    const ansibleTicket: TicketDetails = {
      ...DATABASE_TICKET,
      ticketType: "ANSIBLE",
      codeAnsible: "- hosts: all",
      namespace: null,
      deployment: null,
      dbName: null,
      sqlCode: null,
    };

    render(<TicketDetail ticket={ansibleTicket} />);

    expect(screen.getByText("- hosts: all")).toBeInTheDocument();
    expect(screen.queryByText("pcbox-api")).not.toBeInTheDocument();
    expect(screen.queryByText("SELECT * FROM users;")).not.toBeInTheDocument();
  });
});
