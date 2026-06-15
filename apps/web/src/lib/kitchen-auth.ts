import "server-only";

import { timingSafeEqual } from "node:crypto";

import { HttpError } from "@/lib/http";
import {
  readKitchenSessionFromCookieHeader,
  validateKitchenSessionToken,
} from "@/lib/kitchen-session";

export function requireKitchenAccess(request: Request): void {
  if (hasKitchenSession(request)) {
    return;
  }

  if (hasValidKitchenToken(request)) {
    return;
  }

  throw new HttpError(401, "unauthorized", "Inicia sesion de cocina");
}

export function requireKitchenMutationAccess(request: Request): void {
  if (hasKitchenSession(request)) {
    return;
  }

  if (hasValidKitchenToken(request)) {
    return;
  }

  throw new HttpError(401, "unauthorized", "Credenciales de cocina invalidas");
}

function hasKitchenSession(request: Request): boolean {
  return validateKitchenSessionToken(
    readKitchenSessionFromCookieHeader(request.headers.get("cookie")),
  );
}

function hasValidKitchenToken(request: Request): boolean {
  const expectedToken = process.env.KITCHEN_MUTATION_TOKEN?.trim() || null;

  if (expectedToken === null) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(
        503,
        "service_unavailable",
        "KITCHEN_MUTATION_TOKEN no esta configurado",
      );
    }

    return false;
  }

  const providedToken = readKitchenToken(request);

  return (
    providedToken !== null && timingSafeTokenEqual(providedToken, expectedToken)
  );
}

function readKitchenToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ") === true) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-sushifrito-kitchen-token");
}

function timingSafeTokenEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}
