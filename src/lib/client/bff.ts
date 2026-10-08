export async function bffGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/bff${endpoint}`, {
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Unable to load data.";
    throw new Error(message);
  }

  return payload as T;
}
