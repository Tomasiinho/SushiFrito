import {
  kdsPriorityForMinutes,
  orderStatusValues,
  type CartItemDto,
  type KdsPriority,
  type KitchenOrderDto,
  type OrderDto,
  type OrderStatus,
  type ProductDto,
  type ScheduleZone,
} from "@sushifrito/shared";

import type { orderItemAddons, orderItems, orders, products } from "../schema";

export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type OrderItemAddonRow = typeof orderItemAddons.$inferSelect;

export type OrderItemLine = {
  item: OrderItemRow;
  addons: readonly OrderItemAddonRow[];
};

const priorityStartWindowMs = 15 * 60 * 1000;

export function emptyStatusCounts(): Record<OrderStatus, number> {
  return {
    cancelled: 0,
    delivered: 0,
    frying: 0,
    preparing: 0,
    ready: 0,
    received: 0,
  };
}

export function emptyPriorityCounts(): Record<KdsPriority, number> {
  return {
    green: 0,
    red: 0,
    yellow: 0,
  };
}

export function mapProductDto(product: ProductRow): ProductDto {
  return {
    category: product.category,
    description: product.description,
    id: product.id,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    name: product.name,
    price: product.price,
    slug: product.slug,
    sortOrder: product.sortOrder,
  };
}

export function mapOrderDto(
  order: OrderRow,
  lines: readonly OrderItemLine[],
): OrderDto {
  return {
    addonTotal: order.addonTotal,
    createdAt: order.createdAt.toISOString(),
    customerEmail: order.customerEmail,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    isScheduled: order.isScheduled,
    items: lines.map(mapCartItem),
    kdsVisible: order.kdsVisible,
    notes: order.notes,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    scheduledBlockEnd: order.scheduledBlockEnd,
    scheduledBlockStart: order.scheduledBlockStart,
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    scheduledZone: mapScheduleZone(order.scheduledZone),
    status: order.status,
    subtotal: order.subtotal,
    total: order.total,
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function mapKitchenOrderDto(
  order: OrderRow,
  lines: readonly OrderItemLine[],
  now: Date,
): KitchenOrderDto {
  const priorityStartsAt =
    order.isScheduled && order.scheduledFor !== null
      ? new Date(order.scheduledFor.getTime() - priorityStartWindowMs)
      : order.createdAt;
  const minutesWaiting = Math.max(
    0,
    Math.floor((now.getTime() - priorityStartsAt.getTime()) / 60_000),
  );

  return {
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    isScheduled: order.isScheduled,
    items: lines.map(mapCartItem),
    minutesWaiting,
    minutesElapsed: minutesWaiting,
    paymentMethod: order.paymentMethod,
    priority: kdsPriorityForMinutes(minutesWaiting),
    scheduled: order.isScheduled,
    scheduledBlock:
      order.scheduledBlockStart === null || order.scheduledBlockEnd === null
        ? null
        : `${order.scheduledBlockStart}-${order.scheduledBlockEnd}`,
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    scheduledZone: mapScheduleZone(order.scheduledZone),
    status: order.status,
    total: order.total,
  };
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

export function knownOrderStatuses(): readonly OrderStatus[] {
  return orderStatusValues;
}

function mapCartItem(line: OrderItemLine): CartItemDto {
  return {
    addons: line.addons.map((addon) => ({
      addonId: addon.addonId,
      id: addon.id,
      name: addon.addonName,
      quantity: addon.quantity,
      unitPrice: addon.unitPrice,
    })),
    id: line.item.id,
    name: line.item.productName,
    notes: line.item.notes,
    productId: line.item.productId,
    quantity: line.item.quantity,
    unitPrice: line.item.unitPrice,
  };
}

function mapScheduleZone(value: string | null): ScheduleZone | null {
  return value;
}

function formatOrderNumber(orderId: string): string {
  return `SF-${orderId.slice(0, 8).toUpperCase()}`;
}
