type ApiEnvelope<T> = { status: "ok"; message?: string } & T;
type ApiErrorEnvelope = { status: "error"; message: string };

export class ApiError extends Error {}

export async function parseResponse<T>(res: Response): Promise<ApiEnvelope<T>> {
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

export async function postForm<T>(path: string, formData: FormData): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, { method: "POST", credentials: "include", body: formData });
  return parseResponse<T>(res);
}

export interface DownloadedFile {
  blob: Blob;
  filename: string | null;
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match ? match[1] : null;
}

export async function postBlob(path: string, body: unknown): Promise<DownloadedFile> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const errorBody = (await res.json()) as ApiErrorEnvelope;
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // response body wasn't JSON — keep the default message
    }
    throw new ApiError(message);
  }

  const blob = await res.blob();
  const filename = filenameFromContentDisposition(res.headers.get("Content-Disposition"));
  return { blob, filename };
}
