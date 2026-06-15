import type { OrderStatus } from "@/types/shared";

export type TrackingStatusCopy = {
  title: string;
  eta: string;
  caption: string;
};

export const trackingStatusCopy: Record<OrderStatus, TrackingStatusCopy> = {
  cancelled: {
    caption: "No se seguirá preparando este pedido.",
    eta: "Cancelado",
    title: "Pedido cancelado"
  },
  delivered: {
    caption: "Pedido marcado como retirado.",
    eta: "Entregado",
    title: "Gracias por pedir"
  },
  frying: {
    caption: "Va tomando color y crunch en cocina.",
    eta: "10-15 min",
    title: "Está friéndose"
  },
  preparing: {
    caption: "Estamos armando cortes, salsas y palitos.",
    eta: "15-20 min",
    title: "Cocina lo está preparando"
  },
  ready: {
    caption: "Muestra el QR al retirar tu pedido.",
    eta: "Retiro ahora",
    title: "Listo para retiro"
  },
  received: {
    caption: "La cocina recibió tu pedido y lo pondrá en cola.",
    eta: "20-25 min",
    title: "Recibimos tu pedido"
  }
};
