import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TicketsListView from "./TicketsListView";
import type { TicketDetails } from "@/app/home/tickets/tickets.dto";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const ANSIBLE_TICKET: TicketDetails = {
  id: 1,
  number: "DC-1",
  department: "Centro de datos",
  subject: "Restart service",
  status: "CREATED",
  description: "Restart the web service",
  ticketType: "ANSIBLE",
  codeAnsible: "- hosts: all",
  codeYaml: null,
  response: null,
  namespace: null,
  deployment: null,
  dbName: null,
  sqlCode: null,
};

const DATABASE_TICKET: TicketDetails = {
  id: 2,
  number: "DB-1",
  department: "Base de datos",
  subject: "Read a row",
  status: "CREATED",
  description: "Need to read one row",
  ticketType: "DATABASE",
  codeAnsible: null,
  codeYaml: null,
  response: null,
  namespace: "pcbox-api",
  deployment: "pcbox-db-deploy",
  dbName: "pcbox-db",
  sqlCode: "SELECT * FROM users;",
};

const KUBERNETES_TICKET: TicketDetails = {
  id: 3,
  number: "KB-1",
  department: "Kubernetes",
  subject: "Deploy manifest",
  status: "CREATED",
  description: "Apply the new deployment manifest",
  ticketType: "KUBERNETES",
  codeAnsible: null,
  codeYaml: "apiVersion: apps/v1",
  response: null,
  namespace: null,
  deployment: null,
  dbName: null,
  sqlCode: null,
};

function mockTicketsFetch(ticket: TicketDetails) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: [ticket] }),
  });
}

describe("TicketsListView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches /api/tickets/ansible and shows the ANSIBLE ticket when ticketType="ANSIBLE"', async () => {
    vi.stubGlobal("fetch", mockTicketsFetch(ANSIBLE_TICKET));

    render(<TicketsListView ticketType="ANSIBLE" title="Tickets Centro de Datos" />);

    expect(
      screen.getByRole("heading", { name: "Tickets Centro de Datos" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("DC-1")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/tickets/ansible");
  });

  it('fetches /api/tickets/database and shows the DATABASE ticket when ticketType="DATABASE"', async () => {
    vi.stubGlobal("fetch", mockTicketsFetch(DATABASE_TICKET));

    render(<TicketsListView ticketType="DATABASE" title="Tickets Base de Datos" />);

    expect(
      screen.getByRole("heading", { name: "Tickets Base de Datos" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("DB-1")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/tickets/database");
  });

  it('fetches /api/tickets/kubernetes and shows the KUBERNETES ticket when ticketType="KUBERNETES"', async () => {
    vi.stubGlobal("fetch", mockTicketsFetch(KUBERNETES_TICKET));

    render(<TicketsListView ticketType="KUBERNETES" title="Tickets Kubernetes" />);

    expect(
      screen.getByRole("heading", { name: "Tickets Kubernetes" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("KB-1")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/tickets/kubernetes");
  });

  it("never calls the merged /api/tickets endpoint", async () => {
    vi.stubGlobal("fetch", mockTicketsFetch(ANSIBLE_TICKET));

    render(<TicketsListView ticketType="ANSIBLE" title="Tickets Centro de Datos" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tickets/ansible");
    });
    expect(fetch).not.toHaveBeenCalledWith("/api/tickets");
  });
});
