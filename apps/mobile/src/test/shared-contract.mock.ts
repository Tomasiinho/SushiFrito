import { z } from "zod";

import type {
  CreateOrderPayload,
  KitchenOrderDto,
  OrderDto,
  ProductDto,
} from "@/types/shared";

export const createOrderSchema: z.ZodType<CreateOrderPayload> = z.object({
  customerId: z.uuid().nullable().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.email().nullable().optional(),
  notes: z.string().nullable(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
        notes: z.string().nullable(),
        addons: z.array(
          z.object({
            addonId: z.uuid(),
            quantity: z.number().int().positive(),
          }),
        ),
      }),
    )
    .min(1),
  paymentMethod: z.enum(["junaeb", "debit"]),
  scheduled: z
    .object({
      date: z.string(),
      blockStart: z.string(),
      blockEnd: z.string(),
      zone: z
        .string()
        .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u)
        .optional(),
    })
    .nullable()
    .optional(),
});

export const cloneOrderItemsForCart = (
  items: readonly OrderDto["items"][number][],
): OrderDto["items"] =>
  items.map((item) => ({
    ...item,
    sauces: [...item.sauces],
  }));

export const scheduleBlocks = {
  upla_playa_ancha: [
    {
      id: "upla-humanidades-lunch",
      zone: "upla_playa_ancha",
      label: "UPLA Humanidades",
      subtitle: "Acceso Humanidades",
      start: "12:00",
      end: "13:10",
    },
  ],
  valpo_centro: [
    {
      id: "valpo-victoria-lunch",
      zone: "valpo_centro",
      label: "Plaza Victoria",
      subtitle: "Centro",
      start: "12:30",
      end: "13:45",
    },
  ],
} as const;

export const formatClp = (amount: number): string =>
  new Intl.NumberFormat("es-CL", {
    currency: "CLP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);

export const kdsPriorityForMinutes = (
  minutes: number,
): "green" | "yellow" | "red" => {
  if (minutes >= 12) {
    return "red";
  }

  if (minutes >= 7) {
    return "yellow";
  }

  return "green";
};

export type { KitchenOrderDto, OrderDto, ProductDto };
