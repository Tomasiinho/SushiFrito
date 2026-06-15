import type { z } from "zod";

import type {
  kdsPriorityValues,
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
  scheduleBlocks,
} from "./constants";
import type {
  createOrderSchema,
  deviceTokenSchema,
  kitchenPauseSchema,
  updateOrderStatusSchema,
} from "./schemas";
import type { kitchenSummarySchema } from "./kitchen-schemas";

export type OrderStatus = (typeof orderStatusValues)[number];
export type PaymentMethod = (typeof paymentMethodValues)[number];
export type PaymentStatus = (typeof paymentStatusValues)[number];
export type KdsPriority = (typeof kdsPriorityValues)[number];
export type ScheduleZone = string;
export type ScheduleBlock =
  (typeof scheduleBlocks)[keyof typeof scheduleBlocks][number];

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
};

export type PickupBlockDto = {
  id: string;
  zone: string;
  label: string;
  subtitle: string;
  start: string;
  end: string;
  sortOrder: number;
  isActive: boolean;
};

export type PickupZoneDto = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  blocks: PickupBlockDto[];
};

export type CartAddonDto = {
  id: string;
  addonId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CartItemDto = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string | null;
  addons: CartAddonDto[];
};

export type CreateOrderInput = z.output<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.output<typeof updateOrderStatusSchema>;
export type DeviceTokenInput = z.output<typeof deviceTokenSchema>;
export type KitchenPauseInput = z.output<typeof kitchenPauseSchema>;

export type OrderDto = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  addonTotal: number;
  total: number;
  notes: string | null;
  isScheduled: boolean;
  scheduledFor: string | null;
  scheduledBlockStart: string | null;
  scheduledBlockEnd: string | null;
  scheduledZone: ScheduleZone | null;
  kdsVisible: boolean;
  items: CartItemDto[];
  createdAt: string;
  updatedAt: string;
};

export type KitchenOrderDto = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: KdsPriority;
  paymentMethod: PaymentMethod;
  total: number;
  minutesWaiting: number;
  minutesElapsed: number;
  customerName: string;
  customerPhone: string;
  isScheduled: boolean;
  scheduled: boolean;
  scheduledFor: string | null;
  scheduledBlock: string | null;
  scheduledZone: ScheduleZone | null;
  items: CartItemDto[];
  createdAt: string;
};

export type KitchenSummaryDto = z.output<typeof kitchenSummarySchema>;
