import { describe, expect, it } from "vitest";

import {
  createOrderAccessToken,
  verifyOrderAccessToken,
} from "@/lib/order-access-token";
import type { OrderDto } from "@sushifrito/shared";

const order: OrderDto = {
  addonTotal: 0,
  createdAt: "2026-06-15T00:00:00.000Z",
  customerEmail: null,
  customerId: "0847f2ba-6f2b-4e43-b646-5749df31ad2d",
  customerName: "QA SushiFrito",
  customerPhone: "+56900000000",
  id: "489a2016-9bca-408a-a487-3ff5ce657117",
  isScheduled: false,
  items: [],
  kdsVisible: true,
  notes: null,
  orderNumber: "SF-489A2016",
  paymentMethod: "debit",
  paymentStatus: "paid",
  scheduledBlockEnd: null,
  scheduledBlockStart: null,
  scheduledFor: null,
  scheduledZone: null,
  status: "received",
  subtotal: 5200,
  total: 5200,
  updatedAt: "2026-06-15T00:00:00.000Z",
};

describe("order access token", () => {
  it("validates only tokens bound to the same order and customer", () => {
    const token = createOrderAccessToken(order);

    expect(token).toEqual(expect.any(String));
    expect(verifyOrderAccessToken(order, token ?? "")).toBe(true);
    expect(
      verifyOrderAccessToken(
        { ...order, customerId: crypto.randomUUID() },
        token ?? "",
      ),
    ).toBe(false);
    expect(
      verifyOrderAccessToken({ ...order, id: crypto.randomUUID() }, token ?? ""),
    ).toBe(false);
  });

  it("does not create access tokens for orders without customer ownership", () => {
    expect(createOrderAccessToken({ ...order, customerId: null })).toBeNull();
  });
});
