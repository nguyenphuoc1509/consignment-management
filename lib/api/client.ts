// lib/api/client.ts
// Client-side fetch wrapper for API calls.

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? body?.message ?? "Unknown error"
    );
  }

  if (body?.success === false) {
    throw new ApiError(res.status, body.error ?? "Request failed");
  }

  return (body?.data ?? body) as T;
}

export const api = {
  get<T>(url: string): Promise<T> {
    return request<T>(url);
  },

  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: "PUT",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  delete(url: string): Promise<void> {
    return request<void>(url, { method: "DELETE" });
  },
};
