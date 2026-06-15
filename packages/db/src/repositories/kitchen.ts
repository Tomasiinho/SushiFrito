import { and, asc, count, eq, lte, notInArray } from "drizzle-orm";

import {
  canTransitionOrderStatus,
  orderStatusValues,
  updateOrderStatusSchema,
  type KitchenOrderDto,
  type KitchenSummaryDto,
  type UpdateOrderStatusInput,
} from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { kitchenSettings, orders, orderStatusHistory } from "../schema";
import { RepositoryError } from "./errors";
import { hydrateKitchenOrders } from "./hydration";
import { emptyPriorityCounts, emptyStatusCounts, isTerminalStatus } from "./mappers";
import { getOrderById } from "./orders";

const hiddenScheduleWindowMs = 15 * 60 * 1000;

export async function getKitchenOrders(db: SushiFritoDb): Promise<KitchenOrderDto[]> {
  const now = new Date();
  await revealScheduledOrders(db, now);

  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.kdsVisible, true), notInArray(orders.status, ["delivered", "cancelled"])))
    .orderBy(asc(orders.createdAt));

  return hydrateKitchenOrders(db, rows, now);
}

export async function updateOrderStatus(db: SushiFritoDb, input: UpdateOrderStatusInput): Promise<Awaited<ReturnType<typeof getOrderById>>> {
  const parsed = updateOrderStatusSchema.parse(input);
  const [current] = await db.select().from(orders).where(eq(orders.id, parsed.orderId)).limit(1);

  if (current === undefined) {
    throw new RepositoryError("Order not found");
  }

  if (!canTransitionOrderStatus(current.status, parsed.status)) {
    throw new RepositoryError("Invalid order status transition");
  }

  if (current.status === parsed.status) {
    return getOrderById(db, parsed.orderId);
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        kdsVisible: isTerminalStatus(parsed.status) ? false : current.kdsVisible,
        status: parsed.status,
        statusChangedAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, parsed.orderId));
    await tx.insert(orderStatusHistory).values({
      changedByUserId: parsed.changedByUserId ?? null,
      nextStatus: parsed.status,
      note: parsed.note ?? null,
      orderId: parsed.orderId,
      previousStatus: current.status,
    });
  });

  return getOrderById(db, parsed.orderId);
}

export async function getKitchenSummary(db: SushiFritoDb): Promise<KitchenSummaryDto> {
  const [settings] = await db.select().from(kitchenSettings).where(eq(kitchenSettings.id, "default")).limit(1);
  const ordersForKitchen = await getKitchenOrders(db);
  const byStatus = emptyStatusCounts();
  const byPriority = emptyPriorityCounts();
  const averageWaitMinutes =
    ordersForKitchen.length === 0
      ? 0
      : Math.round(
          ordersForKitchen.reduce((total, order) => total + order.minutesWaiting, 0) / ordersForKitchen.length,
        );
  const [hidden] = await db
    .select({ value: count() })
    .from(orders)
    .where(and(eq(orders.isScheduled, true), eq(orders.kdsVisible, false), notInArray(orders.status, ["delivered", "cancelled"])));

  for (const status of orderStatusValues) {
    byStatus[status] = ordersForKitchen.filter((order) => order.status === status).length;
  }

  for (const order of ordersForKitchen) {
    byPriority[order.priority] += 1;
  }

  return {
    activeOrders: ordersForKitchen.length,
    averageWaitMinutes,
    byPriority,
    byStatus,
    generatedAt: new Date().toISOString(),
    orders: ordersForKitchen,
    paused: settings?.paused ?? false,
    pausedReason: settings?.pauseReason ?? null,
    queueCount: ordersForKitchen.length,
    scheduledHidden: hidden?.value ?? 0,
  };
}

export async function setKitchenPaused(db: SushiFritoDb, paused: boolean): Promise<KitchenSummaryDto> {
  await db
    .insert(kitchenSettings)
    .values({ id: "default", paused, updatedAt: new Date() })
    .onConflictDoUpdate({
      set: {
        paused,
        updatedAt: new Date(),
      },
      target: kitchenSettings.id,
    });

  return getKitchenSummary(db);
}

async function revealScheduledOrders(db: SushiFritoDb, now: Date): Promise<void> {
  const threshold = new Date(now.getTime() + hiddenScheduleWindowMs);

  await db
    .update(orders)
    .set({ kdsVisible: true, updatedAt: now })
    .where(and(eq(orders.isScheduled, true), eq(orders.kdsVisible, false), lte(orders.scheduledFor, threshold)));
}
