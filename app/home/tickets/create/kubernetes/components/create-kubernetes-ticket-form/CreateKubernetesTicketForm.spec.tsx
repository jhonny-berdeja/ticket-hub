import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateKubernetesTicketForm from "./CreateKubernetesTicketForm";

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
    if (url === "/api/tickets/kubernetes") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { id: 7, number: "KB-7" } }),
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
  await user.selectOptions(
    screen.getByLabelText(/tipo de ejecución/i),
    "MANIFEST",
  );
  await user.type(screen.getByLabelText(/asunto/i), "Escalar deployment");
  await user.type(
    screen.getByLabelText(/descripción/i),
    "El deployment necesita más réplicas",
  );
  await user.click(screen.getByRole("button", { name: /crear ticket/i }));
}

describe("CreateKubernetesTicketForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.stubGlobal("fetch", mockTicketsFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the YAML textarea with no character cap and no DATABASE fields", () => {
    render(<CreateKubernetesTicketForm />);

    const yamlTextarea = screen.getByLabelText(/código yaml/i);
    expect(yamlTextarea).not.toHaveAttribute("maxlength");
    expect(screen.queryByLabelText(/sql/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/base de datos/i)).not.toBeInTheDocument();
  });

  it("renders \"Asignar a\" as a select, empty until GET /tickets/assignable-users resolves", async () => {
    render(<CreateKubernetesTicketForm />);

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

  it("navigates to the created ticket's own detail page by number, not id, after a successful submit", async () => {
    const user = userEvent.setup();
    render(<CreateKubernetesTicketForm />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/home/tickets/KB-7");
    });
  });

  it("Cancelar navigates to the KUBERNETES list, not the deleted general list", async () => {
    const user = userEvent.setup();
    render(<CreateKubernetesTicketForm />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledWith("/home/tickets/list/kubernetes");
  });

  it("renders \"Tipo de ejecución\" as a static select with Ansible/Manifest options", () => {
    render(<CreateKubernetesTicketForm />);

    const executionTypeSelect = screen.getByLabelText(/tipo de ejecución/i);
    expect(executionTypeSelect.tagName).toBe("SELECT");
    expect(
      screen.getByRole("option", { name: "Ansible" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Manifest" }),
    ).toBeInTheDocument();
  });

  it("blocks submit with a validation message when no execution type is selected", async () => {
    const user = userEvent.setup();
    render(<CreateKubernetesTicketForm />);

    await screen.findByRole("option", {
      name: /ana gomez \(ana\.gomez@example\.com\)/i,
    });
    await user.selectOptions(
      screen.getByLabelText(/asignar a/i),
      "ana.gomez@example.com",
    );
    await user.type(screen.getByLabelText(/asunto/i), "Escalar deployment");
    await user.type(
      screen.getByLabelText(/descripción/i),
      "El deployment necesita más réplicas",
    );
    await user.click(screen.getByRole("button", { name: /crear ticket/i }));

    expect(
      await screen.findByText(/seleccioná el tipo de ejecución/i),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("sends the selected executionType in the create payload", async () => {
    const user = userEvent.setup();
    const fetchMock = mockTicketsFetch();
    vi.stubGlobal("fetch", fetchMock);
    render(<CreateKubernetesTicketForm />);

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tickets/kubernetes",
        expect.objectContaining({
          body: expect.stringContaining('"executionType":"MANIFEST"'),
        }),
      );
    });
  });

  it("swaps the code field's label to \"Playbook Ansible\" when Ansible is selected", async () => {
    const user = userEvent.setup();
    render(<CreateKubernetesTicketForm />);

    await user.selectOptions(
      screen.getByLabelText(/tipo de ejecución/i),
      "ANSIBLE",
    );

    expect(screen.getByLabelText(/playbook ansible/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^código yaml$/i)).not.toBeInTheDocument();
  });
});
