import type { RequestHandler } from "express";

export type RuntimeEnv = Readonly<Record<string, string | undefined>>;

export interface CorsConfig {
  allowLocalhost: boolean;
  allowedOrigins: ReadonlySet<string>;
}

const originEnvKeys = ["WEB_ORIGIN", "MOBILE_ORIGIN"] as const;

export function createCorsConfig(env: RuntimeEnv): CorsConfig {
  const allowedOrigins = new Set<string>();

  for (const key of originEnvKeys) {
    for (const origin of splitOrigins(env[key])) {
      allowedOrigins.add(origin);
    }
  }

  return {
    allowLocalhost: env.NODE_ENV !== "production",
    allowedOrigins
  };
}

export function isOriginAllowed(
  origin: string | undefined,
  config: CorsConfig
): boolean {
  if (origin === undefined || origin.length === 0) {
    return true;
  }

  if (config.allowedOrigins.has(origin)) {
    return true;
  }

  return config.allowLocalhost && isLocalhostOrigin(origin);
}

export function createCorsMiddleware(config: CorsConfig): RequestHandler {
  return (request, response, next): void => {
    const origin = request.headers.origin;

    if (origin !== undefined && !isOriginAllowed(origin, config)) {
      response.status(403).json({ error: "FORBIDDEN_ORIGIN", ok: false });
      return;
    }

    if (origin !== undefined) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Vary", "Origin");
    }

    response.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Requested-With"
    );
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (request.method === "OPTIONS") {
      response.status(204).send();
      return;
    }

    next();
  };
}

function splitOrigins(value: string | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ["127.0.0.1", "::1", "[::1]", "localhost"].includes(
      url.hostname
    );
  } catch {
    return false;
  }
}
