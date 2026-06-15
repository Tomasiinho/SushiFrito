import { formatClp } from "@/contracts/shared";
import { pickupZoneLabel } from "@/utils/pickup-zone-labels";
import type { OrderDto, OrderStatus } from "@/types/shared";

const dateTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  weekday: "short",
});

const statusLabels: Readonly<Record<OrderStatus, string>> = {
  cancelled: "Cancelado",
  delivered: "Entregado",
  frying: "En fritura",
  preparing: "Preparando",
  ready: "Listo",
  received: "Recibido",
};

export const historyStatusLabel = (status: OrderStatus): string =>
  statusLabels[status];

export const historyDateLabel = (order: OrderDto): string =>
  dateTimeFormatter.format(new Date(order.createdAt));

export const historyPickupLabel = (order: OrderDto): string => {
  const zone = pickupZoneLabel(order.scheduledZone);

  if (!order.scheduledForDate && !order.scheduledForBlockId) {
    return zone ? `Retiro ahora · ${zone}` : "Retiro ahora";
  }

  const date = order.scheduledForDate
    ? dateFormatter.format(new Date(`${order.scheduledForDate}T12:00:00`))
    : "Fecha programada";
  const block = order.scheduledForBlockId ?? "bloque pendiente";

  return [date, block, zone].filter(Boolean).join(" · ");
};

export const historyItemsLabel = (order: OrderDto): string => {
  if (order.items.length === 0) {
    return "Sin detalle de productos";
  }

  const preview = order.items
    .slice(0, 2)
    .map((item) => `${String(item.quantity)}x ${item.name}`)
    .join(" · ");
  const remaining = order.items.length - 2;

  return remaining > 0 ? `${preview} · +${String(remaining)} más` : preview;
};

export const historySaucesLabel = (order: OrderDto): string => {
  const sauces = Array.from(
    new Set(order.items.flatMap((item) => item.sauces)),
  );

  return sauces.length > 0 ? sauces.join(" + ") : "Sin salsas registradas";
};

export const historyTotalLabel = (order: OrderDto): string =>
  formatClp(order.total);
