import { env } from "./env";

export interface HttpErrorShape {
  message: string;
  status: number;
  details?: unknown;
}

export class HttpError extends Error implements HttpErrorShape {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  parse?: "json" | "text" | "void";
  includeAuth?: boolean;
}

const TOKEN_STORAGE_KEY = "umak-eballot:token";

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

export async function http<TResponse = unknown>(path: string, options: RequestOptions = {}) {
  const { parse = "json", headers, includeAuth = true, ...rest } = options;
  const target = `${env.apiBaseUrl}${path}`;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers ?? {}),
  };

  const hasAuthHeader = (() => {
    if (!headers) return false;
    if (headers instanceof Headers) return headers.has("Authorization") || headers.has("authorization");
    if (Array.isArray(headers)) return headers.some(([key]) => key.toLowerCase() === "authorization");
    return Object.keys(headers).some((key) => key.toLowerCase() === "authorization");
  })();

  if (includeAuth && !hasAuthHeader) {
    const token = getStoredToken();
    if (token) {
      (finalHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(target, {
    headers: finalHeaders,
    ...rest,
  });

  if (!response.ok) {
    const fallback = { message: response.statusText };
    let details: unknown = fallback;

    try {
      details = await response.json();
    } catch (error) {
      // no-op; server did not return JSON
    }

    const message = typeof details === "object" && details !== null && "message" in details
      ? String((details as { message?: string }).message)
      : fallback.message;

    throw new HttpError(message ?? "Request failed", response.status, details);
  }

  if (parse === "void") return undefined as TResponse;
  if (parse === "text") return (await response.text()) as TResponse;

  return (await response.json()) as TResponse;
}
