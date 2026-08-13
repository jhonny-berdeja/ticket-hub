interface LoginPayload {
  email: string;
  password: string;
}

/** Thrown for a non-ok response (invalid credentials). */
export class LoginApiError extends Error {}

/** Logs the user in. Rejects with LoginApiError on a non-ok response; any other rejection means a network failure. */
export async function login(payload: LoginPayload): Promise<void> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new LoginApiError("Invalid credentials");
  }
}
