import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ACTIVE_ORDER_STORAGE_KEY,
  loadActiveOrder,
  saveActiveOrder,
  shouldClearActiveOrder
} from "@/store/active-order-storage";
import type { OrderDto } from "@/types/shared";

const activeOrder: OrderDto = {
  createdAt: "2026-06-14T14:00:00.000Z",
  customerId: "customer-1",
  id: "order-1",
  items: [
    {
      chopsticks: true,
      id: "item-1",
      name: "UPLA Furai Roll",
      productId: "product-1",
      quantity: 1,
      sauces: ["soya"],
      unitPrice: 4500
    }
  ],
  orderNumber: "SF-001",
  status: "ready",
  total: 4500
};

describe("active order storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and restores a mobile order", async () => {
    await saveActiveOrder(activeOrder);

    await expect(loadActiveOrder()).resolves.toEqual(activeOrder);
  });

  it("keeps ready orders but clears terminal orders", async () => {
    expect(shouldClearActiveOrder(activeOrder)).toBe(false);

    await saveActiveOrder({ ...activeOrder, status: "delivered" });

    await expect(loadActiveOrder()).resolves.toBeNull();
    await expect(AsyncStorage.getItem(ACTIVE_ORDER_STORAGE_KEY)).resolves.toBeNull();
  });

  it("clears invalid JSON", async () => {
    await AsyncStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, "{bad-json");

    await expect(loadActiveOrder()).resolves.toBeNull();
    await expect(AsyncStorage.getItem(ACTIVE_ORDER_STORAGE_KEY)).resolves.toBeNull();
  });

  it("rejects an API-shaped order missing mobile item fields", async () => {
    await AsyncStorage.setItem(
      ACTIVE_ORDER_STORAGE_KEY,
      JSON.stringify({
        ...activeOrder,
        items: [{ id: "item-1", name: "UPLA Furai Roll" }]
      })
    );

    await expect(loadActiveOrder()).resolves.toBeNull();
  });
});
