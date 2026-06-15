import type { KdsPriority, OrderStatus } from "./types";

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  received: ["preparing", "cancelled"],
  preparing: ["frying", "ready", "cancelled"],
  frying: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function kdsPriorityForMinutes(minutes: number): KdsPriority {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "green";
  }

  if (minutes < 7) {
    return "green";
  }

  if (minutes <= 12) {
    return "yellow";
  }

  return "red";
}

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) {
    return true;
  }

  return allowedTransitions[current].includes(next);
}
