import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { HttpError } from "@/lib/http";

const tokenVersion = "v1";

type TokenParts = {
  customerId: string;
  signature: string;
};

function readSecret(): string {
  const secret =
    process.env.CUSTOMER_ACCESS_TOKEN_SECRET?.trim() ||
    process.env.ORDER_ACCESS_TOKEN_SECRET?.trim() ||
    process.env.KITCHEN_SESSION_SECRET?.trim() ||
    process.env.BETTER_AUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new HttpError(
      503,
      "service_unavailable",
      "CUSTOMER_ACCESS_TOKEN_SECRET no esta configurado",
    );
  }

  return "dev-customer-access-token-secret";
}

function sign(customerId: string): string {
  return createHmac("sha256", readSecret())
    .update(`${tokenVersion}.${customerId}`)
    .digest("base64url");
}

function parseToken(token: string): TokenParts | null {
  const [version, customerId, signature, extra] = token.split(".");

  if (
    version !== tokenVersion ||
    !customerId ||
    !signature ||
    extra !== undefined
  ) {
    return null;
  }

  return { customerId, signature };
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

export function createCustomerAccessToken(customerId: string): string {
  return `${tokenVersion}.${customerId}.${sign(customerId)}`;
}

export function verifyCustomerAccessToken(
  customerId: string,
  token: string,
): boolean {
  const parsed = parseToken(token);

  if (parsed === null || parsed.customerId !== customerId) {
    return false;
  }

  return safeEqual(parsed.signature, sign(customerId));
}

