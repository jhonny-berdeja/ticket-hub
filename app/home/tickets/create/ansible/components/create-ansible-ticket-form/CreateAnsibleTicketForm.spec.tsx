import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateAnsibleTicketForm from "./CreateAnsibleTicketForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const ASSIGNABLE_USERS = [
  { id: 1, name: "Ana", lastname: "Gomez", email: "ana.gomez@example.com" },
  { id: 2, name: "Luis", lastname: "Diaz", email: "luis.diaz@example.com" },
];

function mockTicketsFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/tickets/assignable-users") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: ASSIGNABLE_USERS }),
      });
    }
    if (url === "/api/tickets/ansible") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { id: 7 } }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("option", {
    name: /ana gomez \(ana\.gomez@example\.com\)/i,
  });
  await user.selectOptions(
    screen.getByLabelText(/asignar a/i),
    "ana.gomez@example.com",
  );
  await user.type(screen.getByLabelText(/asunto/i), "Reiniciar servicio");
  await user.type(
    screen.getByLabelText(/descripción/i),
    "El servicio no responde",
  );
  await user.click(screen.getByRole("button", { name: /crear ticket/i }));
}

describe("CreateAnsibleTicketForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.stubGlobal("fetch", mockTicketsFetch());
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

  it("navigates to the created ticket's own detail page after a successful submit", async () => {
    const user = userEvent.setup();
    render(<CreateAnsibleTicketForm />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home/tickets/7");
    });
  });

  it("Cancelar navigates to the ANSIBLE list, not the deleted general list", async () => {
    const user = userEvent.setup();
    render(<CreateAnsibleTicketForm />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledWith("/home/tickets/list/ansible");
  });
});
