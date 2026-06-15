import "server-only";

import { memoryAdapter } from "better-auth/adapters/memory";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

type AuthMemoryDb = Record<string, Record<string, unknown>[]>;

const authMemoryDb: AuthMemoryDb = {};

const authBaseUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

export const auth = betterAuth({
  baseURL: `${authBaseUrl.replace(/\/$/u, "")}/api/auth`,
  database: memoryAdapter(authMemoryDb),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
  },
  plugins: [nextCookies()],
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "sushifrito-development-only-secret-change-me-now",
  trustedOrigins: [
    authBaseUrl,
    "sushifrito://",
    "exp://127.0.0.1:8081",
    "exp://localhost:8081",
  ],
});
