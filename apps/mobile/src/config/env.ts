const readPublicEnv = (key: string): string | undefined => {
  const env: unknown = process.env;

  if (env === null || typeof env !== "object") {
    return undefined;
  }

  const value = (env as Record<string, unknown>)[key];

  return typeof value === "string" ? value : undefined;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

export const API_BASE_URL = trimTrailingSlash(
  readPublicEnv("EXPO_PUBLIC_API_URL") ?? "http://localhost:3000"
);

export const REALTIME_URL = trimTrailingSlash(
  readPublicEnv("EXPO_PUBLIC_REALTIME_URL") ?? ""
);
