import { getOrderHistory } from "@sushifrito/db";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { verifyCustomerAccessToken } from "@/lib/customer-access-token";
import { getDb } from "@/lib/db";
import { handleRoute, HttpError, jsonOk, parseData } from "@/lib/http";

export const runtime = "nodejs";

const historyQuerySchema = z.object({
  customerId: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: NextRequest): Promise<Response> {
  return handleRoute(async () => {
    const query = parseData(
      historyQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const customerToken = request.headers.get("x-sushifrito-customer-token");

    if (
      query.customerId !== undefined &&
      !verifyCustomerAccessToken(query.customerId, customerToken ?? "")
    ) {
      throw new HttpError(
        403,
        "forbidden",
        "No autorizado para este historial",
      );
    }

    const orders =
      query.customerId === undefined
        ? []
        : await getOrderHistory(getDb(), query.customerId);

    return jsonOk({ orders });
  });
}
