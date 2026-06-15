import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { calculateCartTotals } from "@/store/cart-rules";
import {
  isValidPersistedCartStorage,
  parsePersistedCartItems
} from "@/store/storage-schemas";
import type { AddToCartInput, CartItem, CartTotals } from "@/types/cart";
import { createClientId } from "@/utils/id";

export const CART_STORAGE_KEY = "sushifrito.cart";

export type CartStore = {
  items: CartItem[];
  totals: CartTotals;
  addProduct: (input: AddToCartInput) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
};

type PersistedCartState = {
  items: CartItem[];
};

const sameSauces = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((sauce) => right.includes(sauce));

const sameConfiguration = (item: CartItem, input: AddToCartInput): boolean =>
  item.productId === input.product.id &&
  item.chopsticks === input.options.chopsticks &&
  sameSauces(item.sauces, input.options.sauces) &&
  (item.notes ?? "") === (input.options.notes ?? "");

const withTotals = (items: CartItem[]): Pick<CartStore, "items" | "totals"> =>
  ({ items, totals: calculateCartTotals(items) });

const sanitizeStoredCart = async (): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);

  if (!raw) {
    return true;
  }

  try {
    const valid = isValidPersistedCartStorage(JSON.parse(raw) as unknown);

    if (!valid) {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    }

    return valid;
  } catch {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    return false;
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totals: { itemCount: 0, subtotal: 0 },
      addProduct: (input) => {
        set((state) => {
          const quantity = input.options.quantity ?? 1;
          const existing = state.items.find((item) =>
            sameConfiguration(item, input)
          );

          if (existing) {
            return withTotals(
              state.items.map((item) =>
                item.id === existing.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            );
          }

          const nextItem: CartItem = {
            chopsticks: input.options.chopsticks,
            id: createClientId(),
            name: input.product.name,
            productId: input.product.id,
            quantity,
            sauces: [...input.options.sauces],
            unitPrice: input.product.price,
            ...(input.product.imageUrl
              ? { imageUrl: input.product.imageUrl }
              : {}),
            ...(input.options.notes ? { notes: input.options.notes } : {})
          };

          return withTotals([...state.items, nextItem]);
        });
      },
      clearCart: () => {
        set(withTotals([]));
      },
      removeItem: (itemId) => {
        set((state) =>
          withTotals(state.items.filter((item) => item.id !== itemId))
        );
      },
      replaceItems: (items) => {
        set(withTotals(items));
      },
      updateQuantity: (itemId, quantity) =>
        set((state) =>
          withTotals(state.items
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0))
        )
    }),
    {
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...withTotals(parsePersistedCartItems(persistedState))
      }),
      name: CART_STORAGE_KEY,
      partialize: (state): PersistedCartState => ({ items: state.items }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export const resetCartStore = (): void => {
  useCartStore.setState(withTotals([]));
};

export const hydrateCartStore = async (): Promise<void> => {
  const validStorage = await sanitizeStoredCart();

  if (!validStorage) {
    resetCartStore();
    return;
  }

  await useCartStore.persist.rehydrate();
};
