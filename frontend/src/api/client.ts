const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000/api";

type ApiErrorBody = {
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? ((await response.json()) as T & ApiErrorBody)
    : undefined;

  if (!response.ok) {
    const validationMessage = data?.errors?.map((error) => error.message).join(", ");
    throw new Error(validationMessage || data?.message || "Request failed");
  }

  return data as T;
}
