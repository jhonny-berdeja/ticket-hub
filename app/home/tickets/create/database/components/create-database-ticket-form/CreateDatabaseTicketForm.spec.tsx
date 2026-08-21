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

function mockDbTargetsFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: DB_TARGETS }),
  });
}

describe("CreateDatabaseTicketForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockDbTargetsFetch());
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

  it("shows the SQL textarea (capped at 5000 chars) and no YAML textarea", () => {
    render(<CreateDatabaseTicketForm />);

    const sqlTextarea = screen.getByLabelText(/sql/i);
    expect(sqlTextarea).toHaveAttribute("maxlength", "5000");
    expect(screen.queryByLabelText(/código yaml/i)).not.toBeInTheDocument();
  });
});
