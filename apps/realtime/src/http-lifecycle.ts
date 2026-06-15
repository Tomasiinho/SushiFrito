import type { Server as HttpServer } from "node:http";

import type { RealtimeSocketServer } from "./socket-types.js";

export function parsePort(value: string | undefined): number {
  if (value === undefined || value.length === 0) {
    return 4002;
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("PORT must be an integer between 0 and 65535");
  }

  return port;
}

export function getListeningUrl(server: HttpServer): string {
  const address = server.address();

  if (typeof address !== "object" || address === null) {
    throw new Error("Realtime server is not listening on a TCP port");
  }

  return `http://127.0.0.1:${String(address.port)}`;
}

export async function startHttpServer(
  server: HttpServer,
  port: number
): Promise<void> {
  if (server.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}

export async function closeSocketServer(
  io: RealtimeSocketServer
): Promise<void> {
  await new Promise<void>((resolve) => {
    void io.close(() => {
      resolve();
    });
  });
}

export async function closeHttpServer(server: HttpServer): Promise<void> {
  if (!server.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
