import { createOrder } from "@sushifrito/db";
import { createOrderSchema } from "@sushifrito/shared";

import { verifyCustomerAccessToken } from "@/lib/customer-access-token";
import { getDb } from "@/lib/db";
import { handleRoute, HttpError, jsonOk, parseJsonBody } from "@/lib/http";
import { createOrderAccessToken } from "@/lib/order-access-token";
import { emitRealtimeEvent } from "@/lib/realtime";

export const runtime = "nodejs";

function readCustomerToken(request: Request): string | null {
  return request.headers.get("x-sushifrito-customer-token");
}

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, createOrderSchema);

    if (
      input.customerId &&
      !verifyCustomerAccessToken(input.customerId, readCustomerToken(request) ?? "")
    ) {
      throw new HttpError(
        403,
        "forbidden",
        "No autorizado para crear pedidos de este cliente",
      );
    }

    const order = await createOrder(getDb(), input);

    await emitRealtimeEvent({
      event: "order.created",
      payload: { orderId: order.id },
    });

    return jsonOk(
      {
        order,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingToken: createOrderAccessToken(order),
      },
      { status: 201 },
    );
  });
}
