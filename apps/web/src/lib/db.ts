import "server-only";

import { createDb } from "@sushifrito/db";

let cachedDb: ReturnType<typeof createDb> | null = null;

export class DatabaseConfigurationError extends Error {
  public constructor() {
    super("DATABASE_URL is not configured");
    this.name = "DatabaseConfigurationError";
  }
}

export function getDb(): ReturnType<typeof createDb> {
  if (cachedDb !== null) {
    return cachedDb;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new DatabaseConfigurationError();
  }

  cachedDb = createDb(databaseUrl);
  return cachedDb;
}
