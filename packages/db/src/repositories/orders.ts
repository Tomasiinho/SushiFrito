import { desc, eq } from "drizzle-orm";

import { cloneOrderItemsForCart, type CartItemDto, type OrderDto } from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { orders } from "../schema";
import { RepositoryError } from "./errors";
import { hydrateOrders } from "./hydration";

export async function getOrderById(db: SushiFritoDb, id: string): Promise<OrderDto | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (order === undefined) {
    return null;
  }

  const [hydrated] = await hydrateOrders(db, [order]);

  return hydrated ?? null;
}

export async function getOrderHistory(db: SushiFritoDb, customerId: string): Promise<OrderDto[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));

  return hydrateOrders(db, rows);
}

export async function reorder(db: SushiFritoDb, orderId: string): Promise<CartItemDto[]> {
  const order = await getOrderById(db, orderId);

  if (order === null) {
    throw new RepositoryError("Order not found");
  }

  return cloneOrderItemsForCart(order.items);
}
