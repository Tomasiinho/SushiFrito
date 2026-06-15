import { describe, expect, it } from "vitest";

import { buildCreateOrderPayload } from "@/utils/order-payload";
import type { CartItem } from "@/types/cart";

describe("scheduled order payload", () => {
  it("removes schedule fields when the schedule switch is disabled", () => {
    const items: CartItem[] = [
      {
        id: "cart-line-1",
        productId: "018f5c25-0678-7c40-a071-054a5a7f2b19",
        name: "Handroll pollo crispy",
        quantity: 1,
        unitPrice: 4500,
        sauces: ["soya"],
        chopsticks: true,
      },
    ];

    const payload = buildCreateOrderPayload({
      items,
      customerId: "018f5c25-0678-7c40-a071-054a5a7f2b29",
      paymentMethod: "debit",
      schedule: {
        enabled: false,
        date: "2026-06-15",
        blockId: "18-00",
      },
    });

    expect(payload.scheduled).toBeNull();
    expect(payload.customerPhone).toBe("sf018f5c2506787c40a0");
  });

  it("adds the selected pickup zone for scheduled orders", () => {
    const items: CartItem[] = [
      {
        id: "cart-line-1",
        productId: "018f5c25-0678-7c40-a071-054a5a7f2b19",
        name: "Handroll pollo crispy",
        quantity: 1,
        unitPrice: 4500,
        sauces: ["soya"],
        chopsticks: true,
      },
    ];

    const payload = buildCreateOrderPayload({
      items,
      customerId: "018f5c25-0678-7c40-a071-054a5a7f2b29",
      paymentMethod: "debit",
      schedule: {
        enabled: true,
        date: "2026-06-15",
        blockId: "upla-humanidades-lunch",
        blockEnd: "13:10",
        blockStart: "12:00",
        zone: "upla_playa_ancha",
      },
    });

    expect(payload.scheduled).toEqual({
      blockEnd: "13:10",
      blockStart: "12:00",
      date: "2026-06-15",
      zone: "upla_playa_ancha",
    });
  });
});
