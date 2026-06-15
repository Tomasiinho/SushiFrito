import express, { type Express } from "express";
import { createServer } from "node:http";
import { Server as SocketServer } from "socket.io";

import {
  createCorsConfig,
  createCorsMiddleware,
  isOriginAllowed,
  type RuntimeEnv,
} from "./cors.js";
import {
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from "./events.js";
import {
  closeHttpServer,
  closeSocketServer,
  getListeningUrl,
  parsePort,
  startHttpServer,
} from "./http-lifecycle.js";
import { configureRealtimeAdapter } from "./redis-adapter.js";
import { registerRealtimeRoutes } from "./routes.js";
import type { RealtimeSocketServer } from "./socket-types.js";

export interface CreateRealtimeServiceOptions {
  env?: RuntimeEnv;
  port?: number;
}

export interface RealtimeService {
  app: Express;
  getUrl: () => string;
  io: RealtimeSocketServer;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export async function createRealtimeService(
  options: CreateRealtimeServiceOptions = {},
): Promise<RealtimeService> {
  const env = options.env ?? process.env;
  const corsConfig = createCorsConfig(env);
  const app = express();
  const httpServer = createServer(app);
  const io: RealtimeSocketServer = new SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      credentials: true,
      origin: (origin, callback): void => {
        if (isOriginAllowed(origin, corsConfig)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS blocked"), false);
      },
    },
  });
  const adapter = await configureRealtimeAdapter(
    io,
    env.REDIS_URL,
    env.NODE_ENV,
  );
  const port = options.port ?? parsePort(env.PORT);

  app.disable("x-powered-by");
  app.use(createCorsMiddleware(corsConfig));
  app.use(express.json({ limit: "64kb" }));
  registerRealtimeRoutes(app, io, adapter.mode, env);

  return {
    app,
    getUrl: (): string => getListeningUrl(httpServer),
    io,
    start: async (): Promise<void> => startHttpServer(httpServer, port),
    stop: async (): Promise<void> => {
      await closeSocketServer(io);
      await closeHttpServer(httpServer);
      await adapter.close();
    },
  };
}
