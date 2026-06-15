import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { RepositoryError } from "@sushifrito/db";

import { DatabaseConfigurationError } from "@/lib/db";

type ErrorCode =
  | "bad_request"
  | "conflict"
  | "database_not_configured"
  | "forbidden"
  | "not_found"
  | "internal_error"
  | "method_not_allowed"
  | "service_unavailable"
  | "unauthorized";

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details: unknown;

  public constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details: unknown = null,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonOk(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export function jsonError(error: HttpError): Response {
  return jsonOk(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    },
    { status: error.status },
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = (await request.json()) as unknown;
  } catch {
    throw new HttpError(400, "bad_request", "JSON invalido");
  }

  return parseData(schema, body);
}

export function parseData<T>(schema: ZodType<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(400, "bad_request", "Payload invalido", error.issues);
    }

    throw error;
  }
}

export function notFound(message = "Recurso no encontrado"): HttpError {
  return new HttpError(404, "not_found", message);
}

export async function handleRoute(
  work: () => Promise<Response>,
): Promise<Response> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error);
    }

    if (error instanceof ZodError) {
      return jsonError(
        new HttpError(400, "bad_request", "Payload invalido", error.issues),
      );
    }

    if (error instanceof RepositoryError) {
      if (error.message.toLowerCase().includes("not found")) {
        return jsonError(notFound());
      }

      return jsonError(new HttpError(409, "conflict", error.message));
    }

    if (error instanceof DatabaseConfigurationError) {
      return jsonError(
        new HttpError(
          503,
          "database_not_configured",
          "DB no configurada",
        ),
      );
    }

    return jsonError(
      new HttpError(500, "internal_error", "Error interno del servidor"),
    );
  }
}

export function ensureFound<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw notFound();
  }

  return value;
}
