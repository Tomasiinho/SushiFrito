import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

export type SushiFritoDb = NeonDatabase<typeof schema>;

export function createDb(connectionString: string): SushiFritoDb {
  return drizzle(connectionString, { schema });
}
