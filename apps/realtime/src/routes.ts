import type {
  ErrorRequestHandler,
  Express,
  Request,
  RequestHandler,
} from "express";
import { timingSafeEqual } from "node:crypto";

import { emitRealtimeEvent } from "./emitter.js";
import { realtimeEventSchema, type RealtimeEventName } from "./events.js";
import type { RealtimeAdapterMode } from "./redis-adapter.js";
import type { RuntimeEnv } from "./cors.js";
import type { RealtimeSocketServer } from "./socket-types.js";

type EmptyParams = Record<string, never>;
type HealthResponse = { adapter: RealtimeAdapterMode; ok: true };
type EmitResponse =
  | { event: RealtimeEventName; ok: true }
  | {
      error: "EMIT_TOKEN_NOT_CONFIGURED" | "INVALID_EVENT" | "UNAUTHORIZED";
      ok: false;
    };

type EmitAuthConfig = {
  required: boolean;
  token: string | null;
};

export function registerRealtimeRoutes(
  app: Express,
  io: RealtimeSocketServer,
  adapter: RealtimeAdapterMode,
  env: RuntimeEnv,
): void {
  app.get("/health", createHealthHandler(adapter));
  app.post("/emit", createEmitHandler(io, createEmitAuthConfig(env)));
  app.use(createJsonErrorHandler());
}

function createHealthHandler(
  adapter: RealtimeAdapterMode,
): RequestHandler<EmptyParams, HealthResponse> {
  return (_request, response): void => {
    response.status(200).json({ adapter, ok: true });
  };
}

function createEmitHandler(
  io: RealtimeSocketServer,
  authConfig: EmitAuthConfig,
): RequestHandler<EmptyParams, EmitResponse, unknown> {
  return (request, response): void => {
    if (authConfig.required && authConfig.token === null) {
      response
        .status(503)
        .json({ error: "EMIT_TOKEN_NOT_CONFIGURED", ok: false });
      return;
    }

    if (
      authConfig.token !== null &&
      !isEmitAuthorized(request, authConfig.token)
    ) {
      response.status(401).json({ error: "UNAUTHORIZED", ok: false });
      return;
    }

    const result = realtimeEventSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({ error: "INVALID_EVENT", ok: false });
      return;
    }

    emitRealtimeEvent(io, result.data);
    response.status(202).json({ event: result.data.event, ok: true });
  };
}

function createEmitAuthConfig(env: RuntimeEnv): EmitAuthConfig {
  const token = env.REALTIME_EMIT_TOKEN?.trim() || null;

  return {
    required: token !== null || env.NODE_ENV === "production",
    token,
  };
}

function isEmitAuthorized(request: Request, expectedToken: string): boolean {
  const authorization = request.headers.authorization;
  const bearerToken =
    authorization?.startsWith("Bearer ") === true
      ? authorization.slice("Bearer ".length).trim()
      : null;
  const headerToken = readHeaderValue(
    request.headers["x-sushifrito-realtime-token"],
  );
  const providedToken = bearerToken ?? headerToken;

  return (
    providedToken !== null && timingSafeTokenEqual(providedToken, expectedToken)
  );
}

function readHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function timingSafeTokenEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

function createJsonErrorHandler(): ErrorRequestHandler {
  return (error, request, response, next): void => {
    void error;
    void next;
    void request;
    response.status(400).json({ error: "INVALID_EVENT", ok: false });
  };
}
