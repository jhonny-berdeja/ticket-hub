import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const setCookie = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: setCookie,
  })),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/login", () => {
  const originalFetch = global.fetch;
  const originalApiUrl = process.env.TICKET_HUB_API_URL;
  const originalCookieSecure = process.env.TICKET_HUB_COOKIE_SECURE;

  beforeEach(() => {
    setCookie.mockClear();
    process.env.TICKET_HUB_API_URL =
      "http://ticket-hub-api.ticket-hub.svc.cluster.local:3000";
    process.env.TICKET_HUB_COOKIE_SECURE = "true";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TICKET_HUB_API_URL = originalApiUrl;
    process.env.TICKET_HUB_COOKIE_SECURE = originalCookieSecure;
  });

  it("sets an httpOnly cookie and returns ok on valid credentials, never leaking the token in the body", async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ access_token: "secret-jwt-value" }), {
          status: 200,
        }),
    ) as unknown as typeof fetch;

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "hunter2222" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(JSON.stringify(json)).not.toContain("secret-jwt-value");
    expect(setCookie).toHaveBeenCalledTimes(1);
    expect(setCookie).toHaveBeenCalledWith(
      "ticket-hub-token",
      "secret-jwt-value",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      }),
    );
  });

  it("does not set a cookie and returns a generic error on invalid credentials", async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Invalid credentials" }), {
          status: 401,
        }),
    ) as unknown as typeof fetch;

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "wrong-password" }),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ message: "Invalid credentials" });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("rejects a malformed body before ever calling the backend", async () => {
    global.fetch = vi.fn();

    const response = await POST(makeRequest({ email: "a@b.com" }));

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("respects TICKET_HUB_COOKIE_SECURE=false and does not mark the cookie secure", async () => {
    process.env.TICKET_HUB_COOKIE_SECURE = "false";
    global.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ access_token: "secret-jwt-value" }), {
          status: 200,
        }),
    ) as unknown as typeof fetch;

    await POST(makeRequest({ email: "a@b.com", password: "hunter2222" }));

    expect(setCookie).toHaveBeenCalledWith(
      "ticket-hub-token",
      "secret-jwt-value",
      expect.objectContaining({ secure: false }),
    );
  });
});
