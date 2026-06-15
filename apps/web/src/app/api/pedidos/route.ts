import { createOrder, getKitchenOrders } from "@sushifrito/db";
import { createOrderSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import {
  handleRoute,
  jsonOk,
  parseData,
  parseJsonBody
} from "@/lib/http";
import { requireKitchenAccess } from "@/lib/kitchen-auth";
import {
  toLegacyActiveOrdersResponse,
  toLegacyCreateOrderInput,
  toLegacyCreateOrderResponse,
  legacyCreatePedidoPayloadSchema,
  type LegacyCreatePedidoPayload
} from "@/lib/legacy";
import { emitRealtimeEvent } from "@/lib/realtime";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenAccess(request);

    const orders = await getKitchenOrders(getDb());

    return jsonOk(toLegacyActiveOrdersResponse(orders));
  });
}

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const legacyPayload = await parseJsonBody(request, legacyCreatePedidoPayloadSchema);
    const createInput = toLegacyCreateOrderInput(
      legacyPayload as LegacyCreatePedidoPayload
    );
    const input = parseData(createOrderSchema, createInput);
    const order = await createOrder(getDb(), input);

    await emitRealtimeEvent({
      event: "order.created",
      payload: { orderId: order.id },
    });

    return jsonOk(toLegacyCreateOrderResponse(order), { status: 201 });
  });
}
