import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { HttpError } from "@/lib/http";

export const kitchenSessionCookieName = "sf_kitchen_session";

const sessionTtlMs = 12 * 60 * 60 * 1000;
const localKitchenPassword = "sushifrito-demo-2026";
const localSessionSecret = "local-sushifrito-kitchen-session-secret";

type KitchenSessionPayload = {
  exp: number;
  sid: string;
};

export function readKitchenPassword(): string {
  const password = process.env.KITCHEN_ADMIN_PASSWORD?.trim();

  if (password) {
    return password;
  }

  if (process.env.NODE_ENV === "production") {
    throw new HttpError(
      503,
      "service_unavailable",
      "KITCHEN_ADMIN_PASSWORD no esta configurado",
    );
  }

  return localKitchenPassword;
}

export function createKitchenSessionToken(now = Date.now()): string {
  const payload: KitchenSessionPayload = {
    exp: now + sessionTtlMs,
    sid: randomUUID(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function validateKitchenSessionToken(token: string | null): boolean {
  if (token === null) {
    return false;
  }

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra !== undefined) {
    return false;
  }

  if (!timingSafeTextEqual(signature, signPayload(encodedPayload))) {
    return false;
  }

  const payload = parsePayload(encodedPayload);

  return payload !== null && payload.exp > Date.now();
}

export function readKitchenSessionFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (cookieHeader === null) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === kitchenSessionCookieName) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function kitchenSessionMaxAgeSeconds(): number {
  return Math.floor(sessionTtlMs / 1000);
}

export function timingSafeTextEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", readSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function readSessionSecret(): string {
  const secret = process.env.KITCHEN_SESSION_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new HttpError(
      503,
      "service_unavailable",
      "KITCHEN_SESSION_SECRET no esta configurado",
    );
  }

  return localSessionSecret;
}

function parsePayload(encodedPayload: string): KitchenSessionPayload | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("exp" in decoded) ||
      !("sid" in decoded)
    ) {
      return null;
    }

    const exp = decoded.exp;
    const sid = decoded.sid;

    return typeof exp === "number" && typeof sid === "string"
      ? { exp, sid }
      : null;
  } catch {
    return null;
  }
}
