import { z } from "zod";

import type { CartItem } from "@/types/cart";
import type { OrderDto, OrderItemDto } from "@/types/shared";

const orderStatusStorageSchema = z.enum([
  "received",
  "preparing",
  "frying",
  "ready",
  "delivered",
  "cancelled",
]);
const scheduleZoneStorageSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u);

const orderItemStorageSchema = z.object({
  chopsticks: z.boolean(),
  id: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  name: z.string().min(1),
  notes: z.string().optional(),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  sauces: z.array(z.string()),
  unitPrice: z.number().nonnegative(),
});

const cartStateStorageSchema = z.object({
  items: z.array(orderItemStorageSchema),
});

const cartPersistStorageSchema = z.object({
  state: cartStateStorageSchema,
  version: z.number().optional(),
});

const activeOrderStorageSchema = z.object({
  createdAt: z.string().min(1),
  customerId: z.string().min(1),
  id: z.string().min(1),
  items: z.array(orderItemStorageSchema),
  orderNumber: z.string().min(1),
  pickupCode: z.string().optional(),
  pickupQrUrl: z.string().nullable().optional(),
  readyAt: z.string().optional(),
  scheduledForBlockId: z.string().optional(),
  scheduledForDate: z.string().optional(),
  scheduledZone: scheduleZoneStorageSchema.optional(),
  status: orderStatusStorageSchema,
  total: z.number().nonnegative(),
  trackingToken: z.string().min(16).optional(),
});

type StoredOrderItem = z.output<typeof orderItemStorageSchema>;
type StoredActiveOrder = z.output<typeof activeOrderStorageSchema>;

const toOrderItem = (item: StoredOrderItem): OrderItemDto => ({
  chopsticks: item.chopsticks,
  id: item.id,
  name: item.name,
  productId: item.productId,
  quantity: item.quantity,
  sauces: [...item.sauces],
  unitPrice: item.unitPrice,
  ...(item.imageUrl !== undefined ? { imageUrl: item.imageUrl } : {}),
  ...(item.notes ? { notes: item.notes } : {}),
});

const toOrder = (order: StoredActiveOrder): OrderDto => ({
  createdAt: order.createdAt,
  customerId: order.customerId,
  id: order.id,
  items: order.items.map(toOrderItem),
  orderNumber: order.orderNumber,
  status: order.status,
  total: order.total,
  ...(order.pickupCode ? { pickupCode: order.pickupCode } : {}),
  ...(order.pickupQrUrl !== undefined
    ? { pickupQrUrl: order.pickupQrUrl }
    : {}),
  ...(order.readyAt ? { readyAt: order.readyAt } : {}),
  ...(order.scheduledForBlockId
    ? { scheduledForBlockId: order.scheduledForBlockId }
    : {}),
  ...(order.scheduledForDate
    ? { scheduledForDate: order.scheduledForDate }
    : {}),
  ...(order.scheduledZone ? { scheduledZone: order.scheduledZone } : {}),
  ...(order.trackingToken ? { trackingToken: order.trackingToken } : {}),
});

export const parseCartItemsFromStorage = (value: unknown): CartItem[] => {
  const result = z.array(orderItemStorageSchema).safeParse(value);

  return result.success ? result.data.map(toOrderItem) : [];
};

export const parsePersistedCartItems = (value: unknown): CartItem[] => {
  const result = cartStateStorageSchema.safeParse(value);

  return result.success ? result.data.items.map(toOrderItem) : [];
};

export const isValidPersistedCartStorage = (value: unknown): boolean =>
  cartPersistStorageSchema.safeParse(value).success;

export const parseActiveOrderFromStorage = (
  value: unknown,
): OrderDto | null => {
  const result = activeOrderStorageSchema.safeParse(value);

  return result.success ? toOrder(result.data) : null;
};
