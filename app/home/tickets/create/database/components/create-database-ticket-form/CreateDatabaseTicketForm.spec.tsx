import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateDatabaseTicketForm from "./CreateDatabaseTicketForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
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
    if (url === "/api/tickets/database") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { id: 9 } }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("option", { name: /ticket-hub-db/i });
  await user.selectOptions(
    screen.getByLabelText(/asignar a/i),
    "ana.gomez@example.com",
  );
  await user.selectOptions(screen.getByLabelText(/base de datos/i), "0");
  await user.type(screen.getByLabelText(/asunto/i), "Corregir registro");
  await user.type(
    screen.getByLabelText(/descripción/i),
    "Hay un registro duplicado",
  );
  await user.type(screen.getByLabelText(/sql/i), "SELECT 1;");
  await user.click(screen.getByRole("button", { name: /crear ticket/i }));
}

describe("CreateDatabaseTicketForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
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

  it("navigates to the created ticket's own detail page after a successful submit", async () => {
    const user = userEvent.setup();
    render(<CreateDatabaseTicketForm />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home/tickets/9");
    });
  });

  it("Cancelar navigates to the DATABASE list, not the deleted general list", async () => {
    const user = userEvent.setup();
    render(<CreateDatabaseTicketForm />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledWith("/home/tickets/list/database");
  });
});
