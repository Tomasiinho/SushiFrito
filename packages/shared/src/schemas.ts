import { z } from "zod";

import {
  devicePlatformValues,
  orderStatusValues,
  paymentMethodValues,
} from "./constants";

const datePattern = /^\d{4}-\d{2}-\d{2}$/u;
const timePattern = /^\d{2}:\d{2}$/u;
const slugPattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/u;
const idPattern = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/u;

const nullableTrimmedText = (maxLength: number): z.ZodType<string | null> =>
  z
    .string()
    .trim()
    .max(maxLength)
    .nullable()
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value));

export const createOrderAddonSchema = z
  .object({
    addonId: z.uuid(),
    quantity: z.number().int().min(1).max(20),
  })
  .strict();

export const createOrderItemSchema = z
  .object({
    productId: z.uuid(),
    quantity: z.number().int().min(1).max(50),
    notes: nullableTrimmedText(240),
    addons: z.array(createOrderAddonSchema).default([]),
  })
  .strict();

export const scheduledOrderSchema = z
  .object({
    date: z.string().regex(datePattern),
    blockStart: z.string().regex(timePattern),
    blockEnd: z.string().regex(timePattern),
    zone: z.string().trim().regex(slugPattern).max(80).optional(),
  })
  .strict()
  .refine((value) => value.blockStart < value.blockEnd, {
    message: "blockEnd must be after blockStart",
    path: ["blockEnd"],
  });

export const createOrderSchema = z
  .object({
    customerId: z.uuid().nullable().optional(),
    customerName: z.string().trim().min(2).max(80),
    customerPhone: z.string().trim().min(8).max(20),
    customerEmail: z.email().nullable().optional(),
    paymentMethod: z.enum(paymentMethodValues),
    notes: nullableTrimmedText(500),
    scheduled: scheduledOrderSchema.nullable().optional(),
    items: z.array(createOrderItemSchema).min(1),
  })
  .strict();

export const legacyCreatePedidoSchema = z
  .object({
    cliente: z
      .object({
        nombre: z.string().trim().min(2).max(80),
        telefono: z.string().trim().min(8).max(20),
        email: z.email().nullable().optional(),
      })
      .strict(),
    metodoPago: z.enum(paymentMethodValues),
    notas: nullableTrimmedText(500),
    programado: scheduledOrderSchema.nullable().optional(),
    items: z.array(createOrderItemSchema).min(1),
  })
  .strict()
  .transform((pedido) =>
    createOrderSchema.parse({
      customerName: pedido.cliente.nombre,
      customerPhone: pedido.cliente.telefono,
      customerEmail: pedido.cliente.email ?? null,
      paymentMethod: pedido.metodoPago,
      notes: pedido.notas,
      scheduled: pedido.programado,
      items: pedido.items,
    }),
  );

export const updateOrderStatusSchema = z
  .object({
    orderId: z.uuid(),
    status: z.enum(orderStatusValues),
    changedByUserId: z.uuid().nullable().optional(),
    note: nullableTrimmedText(240),
  })
  .strict();

export const deviceTokenSchema = z
  .object({
    customerId: z.uuid().nullable().optional(),
    deviceId: z.string().trim().min(3).max(128),
    token: z.string().trim().min(16).max(4096),
    platform: z.enum(devicePlatformValues),
  })
  .strict();

export const guestCustomerSchema = z
  .object({
    customerId: z.uuid().optional(),
    customerToken: z.string().trim().min(16).max(4096).optional(),
  })
  .strict();

export const kitchenPauseSchema = z
  .object({
    paused: z.boolean(),
    reason: nullableTrimmedText(240),
  })
  .strict();

export const adminProductSchema = z
  .object({
    slug: z.string().trim().min(2).max(80),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(4).max(360),
    category: z.string().trim().min(2).max(40),
    price: z.number().int().min(0).max(999_999),
    imageUrl: z.url().nullable().optional(),
    isAvailable: z.boolean(),
    sortOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const adminPickupZoneSchema = z
  .object({
    id: z.string().trim().regex(slugPattern).max(80),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(240),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const adminPickupBlockSchema = z
  .object({
    id: z.string().trim().regex(idPattern).max(80),
    zone: z.string().trim().regex(slugPattern).max(80),
    label: z.string().trim().min(2).max(120),
    subtitle: z.string().trim().min(2).max(180),
    start: z.string().regex(timePattern),
    end: z.string().regex(timePattern),
    isActive: z.boolean(),
    sortOrder: z.number().int().min(0).max(10_000),
  })
  .strict()
  .refine((value) => value.start < value.end, {
    message: "end must be after start",
    path: ["end"],
  });
