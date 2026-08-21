import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CreateAnsibleTicketForm from "./CreateAnsibleTicketForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CreateAnsibleTicketForm", () => {
  it("shows the YAML textarea (capped at 500 chars) and no DATABASE fields", () => {
    render(<CreateAnsibleTicketForm />);

    const yamlTextarea = screen.getByLabelText(/código yaml/i);
    expect(yamlTextarea).toHaveAttribute("maxlength", "500");
    expect(screen.queryByLabelText(/sql/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/base de datos/i)).not.toBeInTheDocument();
  });
});
