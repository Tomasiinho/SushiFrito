import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));
const sharedMockPath = fileURLToPath(
  new URL("./src/test/shared-contract.mock.ts", import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: {
      "@": srcPath,
      "@sushifrito/shared": sharedMockPath
    }
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"]
  }
});
