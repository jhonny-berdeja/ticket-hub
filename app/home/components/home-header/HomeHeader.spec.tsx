import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeHeader from "./HomeHeader";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const searchTicketByNumberMock = vi.fn();

vi.mock("@/app/home/components/home-header/home-header.api", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/home/tickets/tickets.api", () => ({
  searchTicketByNumber: (ticketNumber: string) =>
    searchTicketByNumberMock(ticketNumber),
  TicketNotFoundError: class TicketNotFoundError extends Error {},
}));

function typeAndSubmit(user: ReturnType<typeof userEvent.setup>, value: string) {
  const input = screen.getByLabelText("Buscar ticket por número");
  return user.clear(input).then(() =>
    user
      .type(input, value)
      .then(() => user.click(screen.getByRole("button", { name: /buscar/i }))),
  );
}

describe("HomeHeader search", () => {
  beforeEach(() => {
    searchTicketByNumberMock.mockReset();
    pushMock.mockReset();
  });

  it("shows a placeholder mentioning both DC- and DB- formats", () => {
    render(<HomeHeader />);

    expect(
      screen.getByPlaceholderText("Buscar ticket (DC-1 o DB-1)"),
    ).toBeInTheDocument();
  });

  it("shows a validation message and never calls the API for an empty input", async () => {
    const user = userEvent.setup();
    render(<HomeHeader />);

    await user.click(screen.getByRole("button", { name: /buscar/i }));

    expect(
      await screen.findByText("Ingresá un número de ticket válido (DC-1 o DB-1)."),
    ).toBeInTheDocument();
    expect(searchTicketByNumberMock).not.toHaveBeenCalled();
  });

  it("shows a validation message for a non-prefixed or old TK- style input", async () => {
    const user = userEvent.setup();
    render(<HomeHeader />);

    await typeAndSubmit(user, "TK-1");

    expect(
      await screen.findByText("Ingresá un número de ticket válido (DC-1 o DB-1)."),
    ).toBeInTheDocument();
    expect(searchTicketByNumberMock).not.toHaveBeenCalled();
  });

  it("sends the full normalized DC-<n> string, not a bare number, and navigates by ticket number on success", async () => {
    searchTicketByNumberMock.mockResolvedValue({ id: 1, number: "DC-1" });
    const user = userEvent.setup();
    render(<HomeHeader />);

    await typeAndSubmit(user, "dc-1");

    expect(searchTicketByNumberMock).toHaveBeenCalledWith("DC-1");
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/home/tickets/DC-1"),
    );
  });

  it("sends the full normalized DB-<n> string for a database ticket and navigates by ticket number, not id", async () => {
    // Same internal id as the DC-1 ticket above -- datacenter_tickets and
    // database_tickets each have their own id sequence, so navigating by
    // id would collide. Navigation must use `number` instead.
    searchTicketByNumberMock.mockResolvedValue({ id: 1, number: "DB-42" });
    const user = userEvent.setup();
    render(<HomeHeader />);

    await typeAndSubmit(user, "db-42");

    expect(searchTicketByNumberMock).toHaveBeenCalledWith("DB-42");
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/home/tickets/DB-42"),
    );
  });
});
