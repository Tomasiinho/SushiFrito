import { defineConfig } from "drizzle-kit";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? readLocalEnvValue("DATABASE_URL");

if (databaseUrl === null) {
  throw new Error(
    "DATABASE_URL is required. Add it to .env.local at the repo root or export it before running Drizzle.",
  );
}

export default defineConfig({
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema.ts",
  strict: true,
  verbose: true,
});

function readLocalEnvValue(key: string): string | null {
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "../../.env.local"),
    resolve(process.cwd(), "../../apps/web/.env.local"),
  ];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    const value = parseEnvFileValue(readFileSync(candidate, "utf8"), key);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function parseEnvFileValue(content: string, key: string): string | null {
  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.startsWith("#") || !line.startsWith(`${key}=`)) {
      continue;
    }

    const rawValue = line.slice(key.length + 1).trim();
    const unquoted =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue;

    return unquoted.length > 0 ? unquoted : null;
  }

  return null;
}
