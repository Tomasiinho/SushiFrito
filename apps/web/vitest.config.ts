import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@sushifrito/db": new URL("../../packages/db/src", import.meta.url)
        .pathname,
      "@sushifrito/shared": new URL(
        "../../packages/shared/src",
        import.meta.url,
      ).pathname,
      "server-only": new URL("./src/test/server-only.ts", import.meta.url)
        .pathname
    }
  }
});
