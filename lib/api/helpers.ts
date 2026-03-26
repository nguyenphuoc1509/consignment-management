// lib/api/helpers.ts
// Standardized API response helpers — use in every route handler.

export function apiSuccess<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ success: true, data }, { status: 200, ...init });
}

export function apiCreated<T>(data: T): Response {
  return Response.json({ success: true, data }, { status: 201 });
}

export function apiNoContent(): Response {
  return new Response(null, { status: 204 });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

export function apiNotFound(message = "Không tìm thấy"): Response {
  return apiError(message, 404);
}

export function apiUnauthorized(message = "Unauthorized"): Response {
  return apiError(message, 401);
}

export function apiServerError(message = "Internal server error"): Response {
  return apiError(message, 500);
}
