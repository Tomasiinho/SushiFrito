import { describe, expect, it } from "vitest";

import { canStartCheckout } from "@/store/cart-rules";

describe("cart checkout guard", () => {
  it("does not allow checkout when cart is empty", () => {
    expect(canStartCheckout([])).toBe(false);
  });
});
