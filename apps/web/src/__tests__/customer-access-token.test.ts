import { describe, expect, it } from "vitest";

import {
  createCustomerAccessToken,
  verifyCustomerAccessToken,
} from "@/lib/customer-access-token";

describe("customer access token", () => {
  it("validates only tokens bound to the same customer", () => {
    const customerId = "0847f2ba-6f2b-4e43-b646-5749df31ad2d";
    const token = createCustomerAccessToken(customerId);

    expect(verifyCustomerAccessToken(customerId, token)).toBe(true);
    expect(verifyCustomerAccessToken(crypto.randomUUID(), token)).toBe(false);
    expect(verifyCustomerAccessToken(customerId, `${token}.extra`)).toBe(false);
  });
});
