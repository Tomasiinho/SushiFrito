import { io, type Socket } from "socket.io-client";

import { toMobileOrder } from "@/api/orders";
import { REALTIME_URL } from "@/config/env";
import type { OrderDto, OrderStatus } from "@/types/shared";
import type { OrderDto as ApiOrderDto } from "@sushifrito/shared";

export type TrackingSocketHandle = {
  disconnect: () => void;
};

export type TrackingSocketOptions = {
  orderId: string;
  onOrderSignal?: () => void;
  onOrderUpdate: (order: OrderDto) => void;
  realtimeUrl?: string;
};

type TrackingServerEvents = {
  "order.status_changed": (payload: unknown) => void;
};

type TrackingClientEvents = Record<string, never>;

const orderStatuses: readonly OrderStatus[] = [
  "received",
  "preparing",
  "frying",
  "ready",
  "delivered",
  "cancelled"
];

const isApiOrderDto = (value: unknown): value is ApiOrderDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.orderNumber === "string" &&
    (typeof record.customerId === "string" || record.customerId === null) &&
    typeof record.total === "number" &&
    typeof record.createdAt === "string" &&
    orderStatuses.includes(record.status as OrderStatus) &&
    Array.isArray(record.items)
  );
};

const readApiOrderFromPayload = (payload: unknown): ApiOrderDto | null => {
  if (isApiOrderDto(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return isApiOrderDto(record.order) ? record.order : null;
};

export const connectOrderTrackingSocket = (
  options: TrackingSocketOptions
): TrackingSocketHandle | null => {
  const url = options.realtimeUrl ?? REALTIME_URL;

  if (!url) {
    return null;
  }

  const socket: Socket<TrackingServerEvents, TrackingClientEvents> = io(url, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 3000,
    query: { orderId: options.orderId }
  });

  socket.on("order.status_changed", (payload: unknown) => {
    const order = readApiOrderFromPayload(payload);

    if (order?.id === options.orderId) {
      options.onOrderUpdate(toMobileOrder(order));
      return;
    }

    if (
      payload &&
      typeof payload === "object" &&
      (payload as Record<string, unknown>).orderId === options.orderId
    ) {
      options.onOrderSignal?.();
    }
  });

  return {
    disconnect: () => {
      socket.disconnect();
    }
  };
};
