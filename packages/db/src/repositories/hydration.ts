import { asc, inArray } from "drizzle-orm";

import type { KitchenOrderDto, OrderDto } from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { orderItemAddons, orderItems } from "../schema";
import {
  mapKitchenOrderDto,
  mapOrderDto,
  type OrderItemAddonRow,
  type OrderItemLine,
  type OrderRow,
} from "./mappers";

export async function hydrateOrders(db: SushiFritoDb, orderRows: readonly OrderRow[]): Promise<OrderDto[]> {
  if (orderRows.length === 0) {
    return [];
  }

  const linesByOrderId = await getLinesByOrderId(db, orderRows);

  return orderRows.map((order) => mapOrderDto(order, linesByOrderId.get(order.id) ?? []));
}

export async function hydrateKitchenOrders(
  db: SushiFritoDb,
  orderRows: readonly OrderRow[],
  now: Date,
): Promise<KitchenOrderDto[]> {
  if (orderRows.length === 0) {
    return [];
  }

  const linesByOrderId = await getLinesByOrderId(db, orderRows);

  return orderRows.map((order) => mapKitchenOrderDto(order, linesByOrderId.get(order.id) ?? [], now));
}

async function getLinesByOrderId(db: SushiFritoDb, orderRows: readonly OrderRow[]): Promise<Map<string, OrderItemLine[]>> {
  const orderIds = orderRows.map((order) => order.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt));
  const itemIds = itemRows.map((item) => item.id);
  const addonRows =
    itemIds.length === 0
      ? []
      : await db
          .select()
          .from(orderItemAddons)
          .where(inArray(orderItemAddons.orderItemId, itemIds))
          .orderBy(asc(orderItemAddons.createdAt));

  const addonsByItemId = new Map<string, OrderItemAddonRow[]>();
  const linesByOrderId = new Map<string, OrderItemLine[]>();

  for (const addon of addonRows) {
    const current = addonsByItemId.get(addon.orderItemId) ?? [];
    current.push(addon);
    addonsByItemId.set(addon.orderItemId, current);
  }

  for (const item of itemRows) {
    const current = linesByOrderId.get(item.orderId) ?? [];
    current.push({
      addons: addonsByItemId.get(item.id) ?? [],
      item,
    });
    linesByOrderId.set(item.orderId, current);
  }

  return linesByOrderId;
}
