import { describe, it, expect } from "vitest";
import {
  INVALID_TICKET_NUMBER_MESSAGE,
  parseTicketNumber,
} from "./home-header.service";

describe("parseTicketNumber", () => {
  it("normalizes surrounding whitespace around a bare number", () => {
    expect(parseTicketNumber("  1  ")).toBe("1");
    expect(parseTicketNumber("42")).toBe("42");
  });

  it("returns null for an empty or whitespace-only input", () => {
    expect(parseTicketNumber("")).toBeNull();
    expect(parseTicketNumber("   ")).toBeNull();
  });

  it("returns null for the old prefixed formats", () => {
    expect(parseTicketNumber("DC-1")).toBeNull();
    expect(parseTicketNumber("DB-1")).toBeNull();
    expect(parseTicketNumber("TK-1")).toBeNull();
  });

  it("returns null for anything with non-digit characters", () => {
    expect(parseTicketNumber("1a")).toBeNull();
    expect(parseTicketNumber("-1")).toBeNull();
  });
});

describe("INVALID_TICKET_NUMBER_MESSAGE", () => {
  it("mentions a valid ticket number without referencing a prefix", () => {
    expect(INVALID_TICKET_NUMBER_MESSAGE).not.toMatch(/DC-1|DB-1/);
    expect(INVALID_TICKET_NUMBER_MESSAGE).toMatch(/número de ticket válido/);
  });
});
