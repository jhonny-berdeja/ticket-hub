import { describe, it, expect } from "vitest";
import {
  INVALID_TICKET_NUMBER_MESSAGE,
  parseTicketNumber,
} from "./home-header.service";

describe("parseTicketNumber", () => {
  it("normalizes case and surrounding whitespace but keeps the prefix", () => {
    expect(parseTicketNumber("  dc-1  ")).toBe("DC-1");
    expect(parseTicketNumber("db-42")).toBe("DB-42");
  });

  it("accepts both the DC- and DB- prefixes", () => {
    expect(parseTicketNumber("DC-7")).toBe("DC-7");
    expect(parseTicketNumber("DB-7")).toBe("DB-7");
  });

  it("returns null for an empty or whitespace-only input", () => {
    expect(parseTicketNumber("")).toBeNull();
    expect(parseTicketNumber("   ")).toBeNull();
  });

  it("returns null for the old bare-number / TK- prefixed formats", () => {
    expect(parseTicketNumber("1")).toBeNull();
    expect(parseTicketNumber("TK-1")).toBeNull();
  });

  it("returns null for a prefix without digits or with trailing garbage", () => {
    expect(parseTicketNumber("DC-")).toBeNull();
    expect(parseTicketNumber("DC-1a")).toBeNull();
  });
});

describe("INVALID_TICKET_NUMBER_MESSAGE", () => {
  it("mentions both valid prefixes", () => {
    expect(INVALID_TICKET_NUMBER_MESSAGE).toMatch(/DC-1/);
    expect(INVALID_TICKET_NUMBER_MESSAGE).toMatch(/DB-1/);
  });
});
