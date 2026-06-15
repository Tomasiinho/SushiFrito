import { getOrderById, updateOrderStatus } from "@sushifrito/db";
import { updateOrderStatusSchema } from "@sushifrito/shared";
import { z } from "zod";

import { getDb } from "@/lib/db";
import {
  ensureFound,
  handleRoute,
  jsonOk,
  parseData,
  parseJsonBody,
} from "@/lib/http";
import { requireKitchenMutationAccess } from "@/lib/kitchen-auth";
import { normalizeLegacyOrderStatus, toLegacyOrderStatus } from "@/lib/legacy";
import { emitRealtimeEvent } from "@/lib/realtime";
import { type IdRouteContext, readRouteId } from "@/lib/route-params";
import { sendReadyPushNotification } from "@/lib/push";

export const runtime = "nodejs";

const legacyStatusSchema = z
  .object({
    nuevoEstado: z.string().min(1).optional(),
    estado: z.string().min(1).optional(),
  })
  .refine(
    (value) => value.nuevoEstado !== undefined || value.estado !== undefined,
    {
      message: "Debe incluir nuevoEstado o estado",
    },
  );

async function updateLegacyStatus(
  request: Request,
  context: IdRouteContext,
): Promise<Response> {
  return handleRoute(async () => {
    requireKitchenMutationAccess(request);

    const orderId = await readRouteId(context);
    const legacyBody = await parseJsonBody(request, legacyStatusSchema);
    const legacyStatus = legacyBody.nuevoEstado ?? legacyBody.estado ?? "";
    const status = normalizeLegacyOrderStatus(legacyStatus);
    const input = parseData(updateOrderStatusSchema, { orderId, status });
    const db = getDb();
    const previousOrder = ensureFound(await getOrderById(db, orderId));
    const order = ensureFound(await updateOrderStatus(db, input));

    if (status === "ready" && previousOrder.status !== "ready") {
      await sendReadyPushNotification(order);
    }

    await emitRealtimeEvent({
      event: "order.status_changed",
      payload: { orderId, status },
    });

    return jsonOk({
      success: true,
      message: `Pedido actualizado a: ${toLegacyOrderStatus(status)}`,
      pedido: {
        id: orderId,
        estado: toLegacyOrderStatus(status),
      },
    });
  });
}

export async function PUT(
  request: Request,
  context: IdRouteContext,
): Promise<Response> {
  return updateLegacyStatus(request, context);
}

export async function PATCH(
  request: Request,
  context: IdRouteContext,
): Promise<Response> {
  return updateLegacyStatus(request, context);
}
