import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  response: null,
  namespace: "pcbox-api",
  deployment: "pcbox-db-deploy",
  dbName: "pcbox-db",
  sqlCode: "SELECT * FROM users;",
};

function mockTicketsFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: [ANSIBLE_TICKET, DATABASE_TICKET] }),
  });
}

describe("TicketsListView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockTicketsFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows only ANSIBLE (datacenter) tickets when ticketType=\"ANSIBLE\"", async () => {
    render(<TicketsListView ticketType="ANSIBLE" title="Tickets Centro de Datos" />);

    expect(
      screen.getByRole("heading", { name: "Tickets Centro de Datos" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("DC-1")).toBeInTheDocument();
    expect(screen.queryByText("DB-1")).not.toBeInTheDocument();
  });

  it("shows only DATABASE tickets when ticketType=\"DATABASE\"", async () => {
    render(<TicketsListView ticketType="DATABASE" title="Tickets Base de Datos" />);

    expect(
      screen.getByRole("heading", { name: "Tickets Base de Datos" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("DB-1")).toBeInTheDocument();
    expect(screen.queryByText("DC-1")).not.toBeInTheDocument();
  });

  it("still fetches the shared /api/tickets endpoint, not a type-specific one", async () => {
    render(<TicketsListView ticketType="ANSIBLE" title="Tickets Centro de Datos" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tickets");
    });
  });
});
