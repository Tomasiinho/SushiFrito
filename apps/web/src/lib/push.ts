import "server-only";

import {
  deactivateDeviceToken,
  getActiveDevicePushTargets,
  recordNotificationLog,
} from "@sushifrito/db";
import type { OrderDto } from "@sushifrito/shared";
import { z } from "zod";

import { getDb } from "@/lib/db";

const expoPushUrl = "https://exp.host/--/api/v2/push/send";
const readyTitle = "Pedido listo";
const readyBody = "¡Tu SushiFrito está crujiente y listo para retiro!";

type ExpoPushMessage = {
  to: string;
  sound: "default";
  channelId: "orders";
  priority: "high";
  title: string;
  body: string;
  data: {
    type: "pickup-ready";
    orderId: string;
    pickupCode: string;
  };
};

const expoTicketSchema = z
  .object({
    data: z.union([
      z
        .object({
          id: z.string().optional(),
          status: z.literal("ok"),
        })
        .strict(),
      z
        .object({
          details: z
            .object({
              error: z.string().optional(),
            })
            .catchall(z.unknown())
            .optional(),
          message: z.string().optional(),
          status: z.literal("error"),
        })
        .strict(),
    ]),
  })
  .strict();

export async function sendReadyPushNotification(
  order: OrderDto,
): Promise<void> {
  const db = getDb();
  const targets = await getActiveDevicePushTargets(db, order.customerId);

  await Promise.all(
    targets.map(async (target) => {
      const message: ExpoPushMessage = {
        body: readyBody,
        channelId: "orders",
        data: {
          orderId: order.id,
          pickupCode: order.orderNumber,
          type: "pickup-ready",
        },
        priority: "high",
        sound: "default",
        title: readyTitle,
        to: target.token,
      };

      try {
        const response = await fetch(expoPushUrl, {
          body: JSON.stringify(message),
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const ticket = expoTicketSchema.safeParse(await response.json());
        const ticketError =
          ticket.success && ticket.data.data.status === "error"
            ? (ticket.data.data.details?.error ??
              ticket.data.data.message ??
              "expo_error")
            : null;
        const delivered = response.ok && ticket.success && ticketError === null;

        if (ticketError === "DeviceNotRegistered") {
          await deactivateDeviceToken(db, target.id);
        }

        await recordNotificationLog(db, {
          body: readyBody,
          deviceTokenId: target.id,
          error: delivered
            ? null
            : (ticketError ?? `Expo push HTTP ${String(response.status)}`),
          metadata: {
            provider: "expo",
            responseStatus: response.status,
            ticket: ticket.success ? ticket.data.data : null,
          },
          orderId: order.id,
          status: delivered ? "sent" : "failed",
          title: readyTitle,
        });
      } catch (error) {
        await recordNotificationLog(db, {
          body: readyBody,
          deviceTokenId: target.id,
          error: error instanceof Error ? error.message : "Unknown push error",
          metadata: { provider: "expo" },
          orderId: order.id,
          status: "failed",
          title: readyTitle,
        });
      }
    }),
  );
}
