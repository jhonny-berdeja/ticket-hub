import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CreateAnsibleTicketForm from "./CreateAnsibleTicketForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const ASSIGNABLE_USERS = [
  { id: 1, name: "Ana", lastname: "Gomez", email: "ana.gomez@example.com" },
  { id: 2, name: "Luis", lastname: "Diaz", email: "luis.diaz@example.com" },
];

function mockAssignableUsersFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: ASSIGNABLE_USERS }),
  });
}

describe("CreateAnsibleTicketForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockAssignableUsersFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the YAML textarea (capped at 500 chars) and no DATABASE fields", () => {
    render(<CreateAnsibleTicketForm />);

    const yamlTextarea = screen.getByLabelText(/código yaml/i);
    expect(yamlTextarea).toHaveAttribute("maxlength", "500");
    expect(screen.queryByLabelText(/sql/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/base de datos/i)).not.toBeInTheDocument();
  });

  it("renders \"Asignar a\" as a select, empty until GET /tickets/assignable-users resolves", async () => {
    render(<CreateAnsibleTicketForm />);

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
});
