import { describe, expect, it } from "vitest";

import { createCartItemsFromOrder } from "@/store/repeat-order";
import type { OrderDto } from "@/types/shared";

describe("repeat order", () => {
  it("deep-copies items and generates different cart item ids", () => {
    const order: OrderDto = {
      id: "order-1",
      orderNumber: "SF-001",
      customerId: "guest-1",
      status: "delivered",
      total: 8900,
      createdAt: "2026-06-14T14:00:00.000Z",
      items: [
        {
          id: "item-original",
          productId: "handroll-ebi",
          name: "Handroll ebi",
          quantity: 2,
          unitPrice: 4450,
          sauces: ["acevichada"],
          chopsticks: true
        }
      ]
    };

    const repeated = createCartItemsFromOrder(order, {
      createId: () => "cart-line-new"
    });

    expect(repeated).toHaveLength(1);
    expect(repeated[0]?.id).toBe("cart-line-new");
    expect(repeated[0]?.id).not.toBe(order.items[0]?.id);

    repeated[0]?.sauces.push("spicy");

    expect(order.items[0]?.sauces).toEqual(["acevichada"]);
  });
});
