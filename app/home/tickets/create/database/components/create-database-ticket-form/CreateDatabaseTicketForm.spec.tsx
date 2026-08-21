import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CreateDatabaseTicketForm from "./CreateDatabaseTicketForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const DB_TARGETS = [
  { namespace: "ticket-hub", deployment: "ticket-hub-db", dbName: "ticket-hub-db" },
  { namespace: "pcbox-api", deployment: "pcbox-db", dbName: "pcbox-db" },
];

const ASSIGNABLE_USERS = [
  { id: 1, name: "Ana", lastname: "Gomez", email: "ana.gomez@example.com" },
  { id: 2, name: "Luis", lastname: "Diaz", email: "luis.diaz@example.com" },
];

function mockTicketsFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/tickets/db-targets") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: DB_TARGETS }),
      });
    }
    if (url === "/api/tickets/assignable-users") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: ASSIGNABLE_USERS }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });
}

describe("CreateDatabaseTicketForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockTicketsFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the allowlisted db-targets from GET /tickets/db-targets and renders them as dropdown options", async () => {
    render(<CreateDatabaseTicketForm />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tickets/db-targets");
    });

    const targetSelect = await screen.findByLabelText(/base de datos/i);
    expect(
      screen.getByRole("option", { name: /ticket-hub-db/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /pcbox-db/i }),
    ).toBeInTheDocument();
    expect(targetSelect).toBeInTheDocument();
  });

  it("renders \"Asignar a\" as a select, populated from GET /tickets/assignable-users", async () => {
    render(<CreateDatabaseTicketForm />);

    const assigneeSelect = screen.getByLabelText(/asignar a/i);
    expect(assigneeSelect.tagName).toBe("SELECT");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tickets/assignable-users");
    });

    expect(
      await screen.findByRole("option", {
        name: /ana gomez \(ana\.gomez@example\.com\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: /luis diaz \(luis\.diaz@example\.com\)/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the SQL textarea (capped at 5000 chars) and no YAML textarea", () => {
    render(<CreateDatabaseTicketForm />);

    const sqlTextarea = screen.getByLabelText(/sql/i);
    expect(sqlTextarea).toHaveAttribute("maxlength", "5000");
    expect(screen.queryByLabelText(/código yaml/i)).not.toBeInTheDocument();
  });
});
