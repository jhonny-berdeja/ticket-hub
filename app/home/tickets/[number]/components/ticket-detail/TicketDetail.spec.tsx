import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TicketDetail from "./TicketDetail";
import { approveTicket } from "./ticket-detail.api";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

vi.mock("@/common/use-current-user/use-current-user", () => ({
  useCurrentUser: () => ({ user: { apps: { application: { roles: [] } } } }),
}));

const isAdminMock = vi.fn().mockReturnValue(false);
vi.mock("@/common/use-current-user/use-current-user.service", () => ({
  isAdmin: () => isAdminMock(),
}));

vi.mock("./ticket-detail.api", () => ({
  approveTicket: vi.fn(),
}));

beforeEach(() => {
  isAdminMock.mockReturnValue(false);
});

const DATABASE_TICKET: TicketDetails = {
  id: 1,
  number: "TK-1",
  department: "Base de datos",
  subject: "Read a row",
  status: "CREATED",
  description: "Need to read one row",
  ticketType: "DATABASE",
  codeAnsible: null,
  codeYaml: null,
  executionType: null,
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

  it("renders the YAML block from codeYaml for a KUBERNETES ticket, and no DATABASE fields", () => {
    const kubernetesTicket: TicketDetails = {
      ...DATABASE_TICKET,
      ticketType: "KUBERNETES",
      codeYaml: "apiVersion: apps/v1",
      executionType: "MANIFEST",
      namespace: null,
      deployment: null,
      dbName: null,
      sqlCode: null,
    };

    render(<TicketDetail ticket={kubernetesTicket} />);

    expect(screen.getByText("apiVersion: apps/v1")).toBeInTheDocument();
    expect(screen.queryByText("pcbox-api")).not.toBeInTheDocument();
    expect(screen.queryByText("SELECT * FROM users;")).not.toBeInTheDocument();
  });

  it("renders the executionType for a KUBERNETES ticket, and omits it for other ticket types", () => {
    const kubernetesTicket: TicketDetails = {
      ...DATABASE_TICKET,
      ticketType: "KUBERNETES",
      codeYaml: "apiVersion: apps/v1",
      executionType: "ANSIBLE",
      namespace: null,
      deployment: null,
      dbName: null,
      sqlCode: null,
    };

    render(<TicketDetail ticket={kubernetesTicket} />);

    expect(screen.getByText(/tipo de ejecución/i)).toBeInTheDocument();
    expect(screen.getByText("ANSIBLE")).toBeInTheDocument();
  });

  it("does not render the execution type field for a DATABASE ticket", () => {
    render(<TicketDetail ticket={DATABASE_TICKET} />);

    expect(screen.queryByText(/tipo de ejecución/i)).not.toBeInTheDocument();
  });
});

describe("TicketDetail — approve flow", () => {
  beforeEach(() => {
    isAdminMock.mockReturnValue(true);
    vi.mocked(approveTicket).mockReset();
  });

  it("replaces the ticket in place with the updated one after a successful approve, without navigating", async () => {
    const updatedTicket: TicketDetails = {
      ...DATABASE_TICKET,
      status: "APPROVED",
      response: "Query executed successfully",
    };
    vi.mocked(approveTicket).mockResolvedValue(updatedTicket);
    const user = userEvent.setup();

    render(<TicketDetail ticket={DATABASE_TICKET} />);
    await user.click(screen.getByRole("button", { name: /aprobar/i }));

    expect(approveTicket).toHaveBeenCalledWith(
      DATABASE_TICKET.ticketType,
      DATABASE_TICKET.id,
    );
    expect(await screen.findByText("APPROVED")).toBeInTheDocument();
    expect(
      screen.getByText("Query executed successfully"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /aprobar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an error and keeps the original ticket when approve fails", async () => {
    vi.mocked(approveTicket).mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();

    render(<TicketDetail ticket={DATABASE_TICKET} />);
    await user.click(screen.getByRole("button", { name: /aprobar/i }));

    expect(
      await screen.findByText(
        "No se pudo aprobar el ticket. Intentá de nuevo.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("CREATED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
  });
});
