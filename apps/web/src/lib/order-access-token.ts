import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { OrderDto } from "@sushifrito/shared";

import { HttpError } from "@/lib/http";

const tokenVersion = "v1";

type TokenParts = {
  customerId: string;
  orderId: string;
  signature: string;
};

function readSecret(): string {
  const secret =
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
      "ORDER_ACCESS_TOKEN_SECRET no esta configurado",
    );
  }

  return "dev-order-access-token-secret";
}

function sign(orderId: string, customerId: string): string {
  return createHmac("sha256", readSecret())
    .update(`${tokenVersion}.${orderId}.${customerId}`)
    .digest("base64url");
}

function parseToken(token: string): TokenParts | null {
  const [version, orderId, customerId, signature, extra] = token.split(".");

  if (
    version !== tokenVersion ||
    !orderId ||
    !customerId ||
    !signature ||
    extra !== undefined
  ) {
    return null;
  }

  return { customerId, orderId, signature };
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

export function createOrderAccessToken(order: OrderDto): string | null {
  if (order.customerId === null) {
    return null;
  }

  return `${tokenVersion}.${order.id}.${order.customerId}.${sign(
    order.id,
    order.customerId,
  )}`;
}

export function verifyOrderAccessToken(order: OrderDto, token: string): boolean {
  if (order.customerId === null) {
    return false;
  }

  const parsed = parseToken(token);

  if (
    parsed === null ||
    parsed.orderId !== order.id ||
    parsed.customerId !== order.customerId
  ) {
    return false;
  }

  return safeEqual(parsed.signature, sign(order.id, order.customerId));
}
