import type {
  KitchenOrderDto,
  KitchenSummaryDto,
  OrderStatus
} from "@/types/kitchen";
import { kitchenOrderSchema, kitchenSummarySchema } from "@sushifrito/shared";
import { z } from "zod";

const kitchenOrdersResponseSchema = z.object({
  orders: z.array(kitchenOrderSchema)
});

const kitchenSummaryResponseSchema = z.union([
  kitchenSummarySchema,
  z.object({ summary: kitchenSummarySchema }).transform((value) => value.summary)
]);

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().nullable().optional()
  })
});

export interface UpdateKitchenOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export class KitchenApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "KitchenApiError";
    this.status = status;
    this.code = code;
  }
}

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await readJsonSafely(response);
    const parsed = errorResponseSchema.safeParse(body);

    if (parsed.success) {
      throw new KitchenApiError(
        response.status,
        parsed.data.error.code,
        parsed.data.error.message
      );
    }

    throw new KitchenApiError(
      response.status,
      "request_failed",
      "No se pudo sincronizar cocina"
    );
  }

  return (await response.json()) as unknown;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function fetchKitchenOrders(): Promise<KitchenOrderDto[]> {
  const data = await fetchJson("/api/kitchen/orders");
  return kitchenOrdersResponseSchema.parse(data).orders;
}

export async function fetchKitchenSummary(): Promise<KitchenSummaryDto> {
  const data = await fetchJson("/api/kitchen/summary");
  return kitchenSummaryResponseSchema.parse(data);
}

export async function updateKitchenOrderStatus({
  orderId,
  status
}: UpdateKitchenOrderStatusInput): Promise<void> {
  await fetchJson(`/api/kitchen/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function setKitchenPause(paused: boolean): Promise<void> {
  await fetchJson("/api/kitchen/pause", {
    method: "POST",
    body: JSON.stringify({
      paused,
      reason: paused ? "high_demand" : null
    })
  });
}
