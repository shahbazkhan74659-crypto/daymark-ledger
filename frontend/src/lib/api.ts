type ApiEnvelope<T> = { status: "ok"; message?: string } & T;
type ApiErrorEnvelope = { status: "error"; message: string };

export class ApiError extends Error {}

async function parseResponse<T>(res: Response): Promise<ApiEnvelope<T>> {
  const body = (await res.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!res.ok || body.status !== "ok") {
    throw new ApiError((body as ApiErrorEnvelope).message ?? `Request failed: ${res.status}`);
  }

  return body;
}

export async function getJson<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, { credentials: "include" });
  return parseResponse<T>(res);
}

export async function postJson<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseResponse<T>(res);
}
