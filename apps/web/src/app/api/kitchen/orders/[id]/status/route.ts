import { getOrderById, updateOrderStatus } from "@sushifrito/db";
import { updateOrderStatusSchema } from "@sushifrito/shared";

import { getDb } from "@/lib/db";
import { ensureFound, handleRoute, jsonOk, parseJsonBody } from "@/lib/http";
import { requireKitchenMutationAccess } from "@/lib/kitchen-auth";
import { sendReadyPushNotification } from "@/lib/push";
import { emitRealtimeEvent } from "@/lib/realtime";
import { type IdRouteContext, readRouteId } from "@/lib/route-params";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: IdRouteContext,
): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenMutationAccess(request);

    const orderId = await readRouteId(context);
    const input = await parseJsonBody(
      request,
      updateOrderStatusSchema.omit({ orderId: true }),
    );
    const db = getDb();
    const previousOrder = ensureFound(await getOrderById(db, orderId));
    const order = ensureFound(
      await updateOrderStatus(db, { ...input, orderId }),
    );

    if (input.status === "ready" && previousOrder.status !== "ready") {
      await sendReadyPushNotification(order);
    }

    await emitRealtimeEvent({
      event: "order.status_changed",
      payload: { orderId, status: input.status },
    });

    return jsonOk(order);
  });
}
