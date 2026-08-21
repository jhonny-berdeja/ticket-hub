/** Logs the current user out. Never throws - the httpOnly cookie can't be cleared client-side anyway. */
export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
}
