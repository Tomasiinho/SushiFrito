import { randomUUID } from "node:crypto";

import { ensureGuestCustomerUser } from "@sushifrito/db";
import { guestCustomerSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import {
  createCustomerAccessToken,
  verifyCustomerAccessToken,
} from "@/lib/customer-access-token";
import { handleRoute, jsonOk, parseJsonBody } from "@/lib/http";

export const runtime = "nodejs";

function resolveGuestCustomerId(input: {
  customerId?: string | undefined;
  customerToken?: string | undefined;
}): string {
  if (
    input.customerId !== undefined &&
    input.customerToken !== undefined &&
    verifyCustomerAccessToken(input.customerId, input.customerToken)
  ) {
    return input.customerId;
  }

  return randomUUID();
}

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, guestCustomerSchema);
    const customerId = resolveGuestCustomerId(input);

    await ensureGuestCustomerUser(getDb(), customerId);

    return jsonOk({
      customer: {
        id: customerId,
        kind: "guest",
      },
      customerToken: createCustomerAccessToken(customerId),
      success: true,
    });
  });
}
