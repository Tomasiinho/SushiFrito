import type { NextConfig } from "next";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  try {
    process.loadEnvFile("../../.env.local");
  } catch {
    // Local convenience only. Runtime validation still happens in getDb().
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;
