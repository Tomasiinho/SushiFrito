import { authClient } from "@/auth/client";
import { API_BASE_URL } from "@/config/env";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  public constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const joinUrl = (path: string): string =>
  path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
};

export const apiFetch = async <ResponseBody>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ResponseBody> => {
  const cookie = authClient.getCookie();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
    ...options.headers
  };

  const response = await fetch(joinUrl(path), {
    method: options.method ?? "GET",
    headers,
    credentials: "omit",
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  });
  const body = await parseJson(response);

  if (!response.ok) {
    throw new ApiError("No se pudo completar la solicitud", response.status, body);
  }

  return body as ResponseBody;
};
