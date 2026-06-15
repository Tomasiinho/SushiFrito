import { z } from "zod";

import {
  kdsPriorityValues,
  orderStatusValues,
} from "./constants";

const cartAddonSchema = z
  .object({
    id: z.string().min(1),
    addonId: z.string().min(1),
    name: z.string().min(1),
    unitPrice: z.number().int().nonnegative(),
    quantity: z.number().int().min(1),
  })
  .strict();

const cartItemSchema = z
  .object({
    id: z.string().min(1),
    productId: z.string().min(1),
    name: z.string().min(1),
    unitPrice: z.number().int().nonnegative(),
    quantity: z.number().int().min(1),
    notes: z.string().nullable(),
    addons: z.array(cartAddonSchema),
  })
  .strict();

export const kitchenOrderSchema = z
  .object({
    id: z.uuid(),
    orderNumber: z.string().min(1),
    status: z.enum(orderStatusValues),
    priority: z.enum(kdsPriorityValues),
    paymentMethod: z.enum(["junaeb", "debit"]),
    total: z.number().int().nonnegative(),
    minutesWaiting: z.number().int().nonnegative(),
    minutesElapsed: z.number().int().nonnegative(),
    customerName: z.string().min(1),
    customerPhone: z.string().min(1),
    isScheduled: z.boolean(),
    scheduled: z.boolean(),
    scheduledFor: z.iso.datetime().nullable(),
    scheduledBlock: z.string().nullable(),
    scheduledZone: z.string().nullable(),
    items: z.array(cartItemSchema),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const kitchenSummarySchema = z
  .object({
    paused: z.boolean(),
    pausedReason: z.string().nullable(),
    activeOrders: z.number().int().nonnegative(),
    queueCount: z.number().int().nonnegative(),
    averageWaitMinutes: z.number().int().nonnegative(),
    scheduledHidden: z.number().int().nonnegative(),
    byStatus: z.record(
      z.enum(orderStatusValues),
      z.number().int().nonnegative(),
    ),
    byPriority: z.record(
      z.enum(kdsPriorityValues),
      z.number().int().nonnegative(),
    ),
    orders: z.array(kitchenOrderSchema),
    generatedAt: z.iso.datetime(),
  })
  .strict();
