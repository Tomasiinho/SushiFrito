import { io as createSocketClient, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";

import type {
  ClientToServerEvents,
  OrderStatusChangedPayload,
  ServerToClientEvents,
} from "../src/events.js";
import { createRealtimeService, type RealtimeService } from "../src/server.js";

type RealtimeTestSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const services: RealtimeService[] = [];

afterEach(async (): Promise<void> => {
  await Promise.all(services.splice(0).map((service) => service.stop()));
});

describe("@sushifrito/realtime", () => {
  it("returns ok from GET /health", async (): Promise<void> => {
    const service = await createRealtimeService({
      env: { NODE_ENV: "test" },
      port: 0,
    });
    services.push(service);
    await service.start();

    const response = await fetch(`${service.getUrl()}/health`);
    const body = (await response.json()) as unknown;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true });
  });

  it("broadcasts order.status_changed from POST /emit to two socket clients in under 1.5s", async (): Promise<void> => {
    const service = await createRealtimeService({
      env: { NODE_ENV: "test" },
      port: 0,
    });
    services.push(service);
    await service.start();

    const clientOne = createClient(service.getUrl());
    const clientTwo = createClient(service.getUrl());

    await Promise.all([waitForConnect(clientOne), waitForConnect(clientTwo)]);

    const startedAt = performance.now();
    const eventOne = waitForOrderStatusChanged(clientOne);
    const eventTwo = waitForOrderStatusChanged(clientTwo);

    const response = await fetch(`${service.getUrl()}/emit`, {
      body: JSON.stringify({
        event: "order.status_changed",
        payload: {
          orderId: "order_test_1",
          status: "preparing",
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const [payloadOne, payloadTwo] = await Promise.all([eventOne, eventTwo]);
    const elapsedMs = performance.now() - startedAt;

    expect(response.status).toBe(202);
    expect(payloadOne).toEqual({
      orderId: "order_test_1",
      status: "preparing",
    });
    expect(payloadTwo).toEqual({
      orderId: "order_test_1",
      status: "preparing",
    });
    expect(elapsedMs).toBeLessThan(1_500);

    clientOne.close();
    clientTwo.close();
  });

  it("requires the internal emit token when REALTIME_EMIT_TOKEN is configured", async (): Promise<void> => {
    const service = await createRealtimeService({
      env: { NODE_ENV: "test", REALTIME_EMIT_TOKEN: "test-secret" },
      port: 0,
    });
    services.push(service);
    await service.start();

    const denied = await fetch(`${service.getUrl()}/emit`, {
      body: JSON.stringify({
        event: "order.status_changed",
        payload: { orderId: "order_test_2", status: "ready" },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const accepted = await fetch(`${service.getUrl()}/emit`, {
      body: JSON.stringify({
        event: "order.status_changed",
        payload: { orderId: "order_test_2", status: "ready" },
      }),
      headers: {
        Authorization: "Bearer test-secret",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    expect(denied.status).toBe(401);
    expect(accepted.status).toBe(202);
  });

  it("rejects order events with extra customer payload", async (): Promise<void> => {
    const service = await createRealtimeService({
      env: { NODE_ENV: "test" },
      port: 0,
    });
    services.push(service);
    await service.start();

    const response = await fetch(`${service.getUrl()}/emit`, {
      body: JSON.stringify({
        event: "order.status_changed",
        payload: {
          customerPhone: "+56900000000",
          order: {
            id: "order_test_3",
          },
          orderId: "order_test_3",
          status: "ready",
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(400);
  });
});

function createClient(url: string): RealtimeTestSocket {
  return createSocketClient(url, {
    reconnection: false,
    transports: ["websocket"],
  });
}

async function waitForConnect(socket: RealtimeTestSocket): Promise<void> {
  if (socket.connected) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const cleanup = (): void => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };
    const handleConnect = (): void => {
      cleanup();
      resolve();
    };
    const handleError = (error: Error): void => {
      cleanup();
      reject(error);
    };

    socket.once("connect", handleConnect);
    socket.once("connect_error", handleError);
  });
}

function waitForOrderStatusChanged(
  socket: RealtimeTestSocket,
): Promise<OrderStatusChangedPayload> {
  return new Promise((resolve) => {
    socket.once("order.status_changed", (payload) => {
      resolve(payload);
    });
  });
}
