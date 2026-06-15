import type {
  CreateOrderInput,
  KitchenOrderDto,
  OrderStatus,
  PaymentMethod,
} from "@sushifrito/shared";
import { z } from "zod";

export interface LegacyCreatePedidoItem {
  producto_id: string | number;
  cantidad: number;
  notes_especiales?: string | null;
  notas_especiales?: string | null;
}

export interface LegacyCreatePedidoPayload {
  usuario_id: string | number;
  metodo_pago: string;
  total: number;
  es_programado: boolean;
  bloque_horario?: string | null;
  items: readonly LegacyCreatePedidoItem[];
}

export const legacyCreatePedidoPayloadSchema = z
  .object({
    usuario_id: z.union([z.string(), z.number()]),
    metodo_pago: z.string().min(1),
    total: z.number().int().nonnegative(),
    es_programado: z.boolean().default(false),
    bloque_horario: z.string().nullable().optional(),
    items: z
      .array(
        z
          .object({
            producto_id: z.union([z.string(), z.number()]),
            cantidad: z.number().int().min(1),
            notes_especiales: z.string().nullable().optional(),
            notas_especiales: z.string().nullable().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const legacyProductIds = new Map<string, string>([
  ["1", "018f5c25-0678-7c40-a071-054a5a7f2b19"],
  ["2", "018f5c25-0678-7c40-a071-054a5a7f2b20"],
  ["3", "018f5c25-0678-7c40-a071-054a5a7f2b21"],
]);

const legacyToCanonicalStatus: Readonly<Record<string, OrderStatus>> = {
  recibido: "received",
  en_preparacion: "preparing",
  en_cocina: "frying",
  listo: "ready",
  entregado: "delivered",
  cancelado: "cancelled",
} as const satisfies Record<string, OrderStatus>;

const canonicalToLegacyStatus = {
  received: "recibido",
  preparing: "en_preparacion",
  frying: "en_cocina",
  ready: "listo",
  delivered: "entregado",
  cancelled: "cancelado",
} as const satisfies Record<OrderStatus, string>;

export function normalizeLegacyPaymentMethod(value: string): PaymentMethod {
  return value.trim().toLowerCase() === "junaeb" ? "junaeb" : "debit";
}

export function normalizeLegacyOrderStatus(value: string): OrderStatus {
  const normalized = value.trim().toLowerCase();
  return legacyToCanonicalStatus[normalized] ?? "received";
}

export function toLegacyOrderStatus(status: OrderStatus): string {
  return canonicalToLegacyStatus[status];
}

export function toLegacyCreateOrderInput(
  payload: LegacyCreatePedidoPayload,
): CreateOrderInput {
  const scheduled = buildLegacySchedule(payload);

  return {
    customerName: `Cliente ${String(payload.usuario_id)}`,
    customerPhone: "+56000000000",
    notes: null,
    paymentMethod: normalizeLegacyPaymentMethod(payload.metodo_pago),
    scheduled,
    items: payload.items.map((item) => ({
      addons: [],
      productId: mapLegacyProductId(item.producto_id),
      quantity: item.cantidad,
      notes: item.notes_especiales ?? item.notas_especiales ?? null,
    })),
  };
}

function mapLegacyProductId(value: string | number): string {
  const key = String(value);
  return legacyProductIds.get(key) ?? key;
}

function buildLegacySchedule(
  payload: LegacyCreatePedidoPayload,
): CreateOrderInput["scheduled"] {
  if (
    !payload.es_programado ||
    payload.bloque_horario === null ||
    payload.bloque_horario === undefined
  ) {
    return null;
  }

  const match = /(?<start>\d{2}:\d{2})\s*(?:a|-)\s*(?<end>\d{2}:\d{2})/u.exec(
    payload.bloque_horario,
  );

  if (match?.groups === undefined) {
    return null;
  }

  return {
    blockEnd: match.groups.end ?? "13:15",
    blockStart: match.groups.start ?? "12:00",
    date: new Date().toISOString().slice(0, 10),
    zone: "valpo_centro",
  };
}

export function toLegacyActiveOrdersResponse(
  orders: readonly KitchenOrderDto[],
): {
  success: true;
  pedidos: readonly {
    pedido_id: string;
    numero_pedido: string;
    estado: string;
    metodo_pago: string;
    total: number;
    es_programado: boolean;
    bloque_horario: string | null;
    creado_en: string;
    minutos_transcurridos: number;
    items: readonly {
      producto_id: string;
      nombre_producto: string;
      cantidad: number;
      notas_especiales: string | null;
    }[];
  }[];
} {
  return {
    success: true,
    pedidos: orders.map((order) => ({
      pedido_id: order.id,
      numero_pedido: order.orderNumber,
      estado: toLegacyOrderStatus(order.status),
      metodo_pago: order.paymentMethod === "junaeb" ? "junaeb" : "debito",
      total: order.total,
      es_programado: order.scheduled,
      bloque_horario: order.scheduledBlock,
      creado_en: order.createdAt,
      minutos_transcurridos: order.minutesElapsed,
      items: order.items.map((item) => ({
        producto_id: item.productId,
        nombre_producto: item.name,
        cantidad: item.quantity,
        notas_especiales: item.notes,
      })),
    })),
  };
}

export function toLegacyCreateOrderResponse(order: {
  id?: string;
  orderId?: string;
  orderNumber?: string;
}): {
  success: true;
  message: string;
  pedido_id: string;
  numero_pedido: string | null;
} {
  return {
    success: true,
    message: "Pedido registrado con exito",
    pedido_id: order.orderId ?? order.id ?? "",
    numero_pedido: order.orderNumber ?? null,
  };
}
