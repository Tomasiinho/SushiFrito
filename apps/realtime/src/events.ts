import { z } from "zod";

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.null(),
    z.number(),
    z.string(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema)
  ])
);

export const orderCreatedPayloadSchema = z
  .object({
    orderId: z.string().min(1)
  })
  .strict();

export const orderStatusChangedPayloadSchema = z
  .object({
    orderId: z.string().min(1),
    status: z.string().min(1)
  })
  .strict();

export const kitchenSummaryChangedPayloadSchema = z.record(
  z.string(),
  jsonValueSchema
);

export const realtimeEventSchema = z.discriminatedUnion("event", [
  z
    .object({
      event: z.literal("order.created"),
      payload: orderCreatedPayloadSchema
    })
    .strict(),
  z
    .object({
      event: z.literal("order.status_changed"),
      payload: orderStatusChangedPayloadSchema
    })
    .strict(),
  z
    .object({
      event: z.literal("kitchen.summary_changed"),
      payload: kitchenSummaryChangedPayloadSchema
    })
    .strict()
]);

export type OrderCreatedPayload = z.infer<typeof orderCreatedPayloadSchema>;
export type OrderStatusChangedPayload = z.infer<
  typeof orderStatusChangedPayloadSchema
>;
export type KitchenSummaryChangedPayload = z.infer<
  typeof kitchenSummaryChangedPayloadSchema
>;
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;
export type RealtimeEventName = RealtimeEvent["event"];

export interface ServerToClientEvents {
  "kitchen.summary_changed": (payload: KitchenSummaryChangedPayload) => void;
  "order.created": (payload: OrderCreatedPayload) => void;
  "order.status_changed": (payload: OrderStatusChangedPayload) => void;
}

export type ClientToServerEvents = Record<string, never>;
export type InterServerEvents = Record<string, never>;
export type SocketData = Record<string, never>;
