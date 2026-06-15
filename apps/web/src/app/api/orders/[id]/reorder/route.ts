import { getOrderById } from "@sushifrito/db";
import { cloneOrderItemsForCart } from "@sushifrito/shared";
import { z } from "zod";

import { getDb } from "@/lib/db";
import {
  ensureFound,
  handleRoute,
  HttpError,
  jsonOk,
  parseJsonBody,
} from "@/lib/http";
import { type IdRouteContext, readRouteId } from "@/lib/route-params";

export const runtime = "nodejs";

const reorderRequestSchema = z
  .object({
    customerId: z.uuid(),
  })
  .strict();

export async function POST(
  request: Request,
  context: IdRouteContext,
): Promise<Response> {
  return handleRoute(async () => {
    const orderId = await readRouteId(context);
    const input = await parseJsonBody(request, reorderRequestSchema);
    const order = ensureFound(await getOrderById(getDb(), orderId));

    if (order.customerId !== input.customerId) {
      throw new HttpError(
        403,
        "forbidden",
        "No autorizado para repetir este pedido",
      );
    }

    return jsonOk(cloneOrderItemsForCart(order.items), { status: 201 });
  });
}
