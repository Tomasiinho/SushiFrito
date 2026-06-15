import type { CartItem, CartTotals } from "@/types/cart";

export const canStartCheckout = (items: readonly CartItem[]): boolean =>
  items.some((item) => item.quantity > 0);

export const calculateCartTotals = (
  items: readonly CartItem[]
): CartTotals => ({
  itemCount: items.reduce((total, item) => total + item.quantity, 0),
  subtotal: items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  )
});
