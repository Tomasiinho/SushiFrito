import { randomUUID } from "node:crypto";

import { inArray } from "drizzle-orm";

import {
  buildScheduledDateTime,
  createOrderSchema,
  type CreateOrderInput,
  type OrderDto,
} from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import {
  addons,
  orderItemAddons,
  orderItems,
  orders,
  orderStatusHistory,
  products,
} from "../schema";
import { RepositoryError } from "./errors";
import { getOrderById } from "./orders";
import { buildItemDrafts } from "./order-drafts";
import { ensureOrderCustomerUser } from "./users";

const kdsVisibilityWindowMs = 15 * 60 * 1000;

export async function createOrder(
  db: SushiFritoDb,
  input: CreateOrderInput,
): Promise<OrderDto> {
  const parsed = createOrderSchema.parse(input);
  const now = new Date();
  const scheduled = parsed.scheduled ?? null;
  const scheduledFor =
    scheduled === null
      ? null
      : buildScheduledDateTime(scheduled.date, scheduled.blockStart);
  const isScheduled = scheduledFor !== null;
  const kdsVisible =
    scheduledFor === null ||
    scheduledFor.getTime() - now.getTime() <= kdsVisibilityWindowMs;
  const productIds = uniqueValues(parsed.items.map((item) => item.productId));
  const addonIds = uniqueValues(
    parsed.items.flatMap((item) => item.addons.map((addon) => addon.addonId)),
  );
  const orderId = randomUUID();

  await db.transaction(async (tx) => {
    await ensureOrderCustomerUser(tx, parsed);

    const productRows = await tx
      .select()
      .from(products)
      .where(inArray(products.id, productIds));
    const addonRows =
      addonIds.length === 0
        ? []
        : await tx.select().from(addons).where(inArray(addons.id, addonIds));
    const drafts = buildItemDrafts(parsed, productRows, addonRows);
    const subtotal = drafts.reduce(
      (total, item) => total + item.lineSubtotal,
      0,
    );
    const addonTotal = drafts.reduce(
      (total, item) => total + item.lineAddonTotal,
      0,
    );

    await tx.insert(orders).values({
      addonTotal,
      customerEmail: parsed.customerEmail ?? null,
      customerId: parsed.customerId ?? null,
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      id: orderId,
      isScheduled,
      kdsVisible,
      notes: parsed.notes ?? null,
      paymentMethod: parsed.paymentMethod,
      paymentStatus: "paid",
      scheduledBlockEnd: scheduled?.blockEnd ?? null,
      scheduledBlockStart: scheduled?.blockStart ?? null,
      scheduledFor,
      scheduledZone: scheduled?.zone ?? null,
      status: "received",
      statusChangedAt: now,
      subtotal,
      total: subtotal + addonTotal,
      updatedAt: now,
    });
    await tx.insert(orderItems).values(
      drafts.map((item) => ({
        id: item.id,
        notes: item.notes,
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );

    const addonValues = drafts.flatMap((item) =>
      item.addons.map((addon) => ({
        addonId: addon.addonId,
        addonName: addon.addonName,
        id: addon.id,
        orderItemId: item.id,
        quantity: addon.quantity,
        unitPrice: addon.unitPrice,
      })),
    );

    if (addonValues.length > 0) {
      await tx.insert(orderItemAddons).values(addonValues);
    }

    await tx.insert(orderStatusHistory).values({
      nextStatus: "received",
      note: "Order created",
      orderId,
      previousStatus: null,
    });
  });

  const order = await getOrderById(db, orderId);

  if (order === null) {
    throw new RepositoryError("Order was created but could not be read");
  }

  return order;
}

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)];
}
