import { describe, expect, it } from "vitest";

import { buildPickupQrPayload, createPickupQrMatrix } from "@/utils/pickup-qr";

describe("pickup QR", () => {
  it("builds a production-safe pickup deeplink without PII", () => {
    const payload = buildPickupQrPayload({
      orderId: "58b3b411-c80b-4d21-a6ca-8b4cfc648f64",
      pickupCode: "SF-58B3B411",
    });

    expect(payload).toBe(
      "sushifrito:///pickup-qr?v=1&orderId=58b3b411-c80b-4d21-a6ca-8b4cfc648f64&pickupCode=SF-58B3B411",
    );
    expect(payload).not.toContain("@");
    expect(payload).not.toContain("+569");
  });

  it("creates a scannable matrix with dark and light modules", () => {
    const matrix = createPickupQrMatrix({
      orderId: "58b3b411-c80b-4d21-a6ca-8b4cfc648f64",
      pickupCode: "SF-58B3B411",
    });

    expect(matrix.size).toBeGreaterThan(20);
    expect(matrix.cells).toHaveLength(matrix.size * matrix.size);
    expect(matrix.cells.some(Boolean)).toBe(true);
    expect(matrix.cells.some((cell) => !cell)).toBe(true);
  });
});
