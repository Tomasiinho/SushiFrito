import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "vitest";

import {
  CART_STORAGE_KEY,
  hydrateCartStore,
  resetCartStore,
  useCartStore
} from "@/store/cart-store";

const persistedCart = (items: unknown[]): string =>
  JSON.stringify({ state: { items }, version: 0 });

const validItem = {
  chopsticks: true,
  id: "cart-line-1",
  name: "UPLA Furai Roll",
  productId: "product-1",
  quantity: 2,
  sauces: ["soya"],
  unitPrice: 4500
};

describe("cart persistence", () => {
  beforeEach(async () => {
    resetCartStore();
    await AsyncStorage.clear();
  });

  it("hydrates items and recalculates totals", async () => {
    await AsyncStorage.setItem(CART_STORAGE_KEY, persistedCart([validItem]));

    await hydrateCartStore();

    expect(useCartStore.getState().items).toEqual([validItem]);
    expect(useCartStore.getState().totals).toEqual({
      itemCount: 2,
      subtotal: 9000
    });
  });

  it("resets to an empty cart when storage is not valid JSON", async () => {
    await AsyncStorage.setItem(CART_STORAGE_KEY, "{bad-json");

    await hydrateCartStore();

    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().totals).toEqual({
      itemCount: 0,
      subtotal: 0
    });
  });

  it("resets to an empty cart when stored items are incomplete", async () => {
    await AsyncStorage.setItem(
      CART_STORAGE_KEY,
      persistedCart([{ id: "cart-line-1", name: "Incomplete" }])
    );

    await hydrateCartStore();

    expect(useCartStore.getState().items).toEqual([]);
  });
});
