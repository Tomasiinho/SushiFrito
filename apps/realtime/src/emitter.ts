import type { RealtimeEvent } from "./events.js";
import type { RealtimeSocketServer } from "./socket-types.js";

export function emitRealtimeEvent(
  io: RealtimeSocketServer,
  event: RealtimeEvent
): void {
  switch (event.event) {
    case "kitchen.summary_changed":
      io.emit("kitchen.summary_changed", event.payload);
      break;
    case "order.created":
      io.emit("order.created", event.payload);
      break;
    case "order.status_changed":
      io.emit("order.status_changed", event.payload);
      break;
  }
}
