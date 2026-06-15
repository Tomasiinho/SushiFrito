# @sushifrito/realtime

Servicio Express + Socket.io para eventos realtime de SushiFrito.

## HTTP

- `GET /health` responde `{ "ok": true, "adapter": "memory" | "redis" }`.
- `POST /emit` recibe `{ "event": string, "payload": object }` y emite a todos los sockets conectados.

Eventos soportados:

- `order.created`
- `order.status_changed`
- `kitchen.summary_changed`

`order.created` acepta solo `payload.orderId`. `order.status_changed` acepta solo `payload.orderId` y `payload.status`. Los payloads son estrictos para evitar filtrar datos de cliente por realtime.

## Configuración

- `PORT`: default `4002`.
- `WEB_ORIGIN`: origin web permitido. Acepta lista separada por coma.
- `MOBILE_ORIGIN`: origin mobile permitido. Acepta lista separada por coma.
- `REDIS_URL`: activa Socket.io Redis adapter. Sin esta variable usa adapter in-memory.

En `NODE_ENV !== "production"` también se permiten origins `localhost`, `127.0.0.1` y `::1`.

## Cliente

El reconnect se configura en cada cliente. Usar `reconnectionDelay: 3000`:

```ts
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_REALTIME_URL, {
  reconnectionDelay: 3000,
  transports: ["websocket"]
});
```
