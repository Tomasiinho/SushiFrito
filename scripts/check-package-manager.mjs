import { existsSync } from "node:fs";

const forbiddenLocks = ["package-lock.json", "yarn.lock"];
const found = forbiddenLocks.filter((file) => existsSync(file));

if (found.length > 0) {
  console.error(`Forbidden lockfile found: ${found.join(", ")}`);
  process.exit(1);
}
