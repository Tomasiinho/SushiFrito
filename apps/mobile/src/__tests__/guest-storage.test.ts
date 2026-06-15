import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it } from "vitest";

import {
  GUEST_CUSTOMER_KEY,
  GUEST_CUSTOMER_TOKEN_KEY,
  loadGuestCustomerSession,
  saveGuestCustomerSession,
} from "@/utils/guest";

const customerId = "018f5c25-0678-7c40-a071-054a5a7f2b29";
const customerToken = `v1.${customerId}.signature`;

describe("guest customer storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("persists and restores the guest customer token", async () => {
    await saveGuestCustomerSession({ customerId, customerToken });

    await expect(loadGuestCustomerSession()).resolves.toEqual({
      customerId,
      customerToken,
    });
  });

  it("keeps legacy guest ids but marks them as missing token", async () => {
    await AsyncStorage.setItem(GUEST_CUSTOMER_KEY, customerId);

    await expect(loadGuestCustomerSession()).resolves.toEqual({
      customerId,
      customerToken: null,
    });
  });

  it("clears corrupt guest ids", async () => {
    await AsyncStorage.setItem(GUEST_CUSTOMER_KEY, "not-a-uuid");
    await AsyncStorage.setItem(GUEST_CUSTOMER_TOKEN_KEY, customerToken);

    await expect(loadGuestCustomerSession()).resolves.toBeNull();
    await expect(AsyncStorage.getItem(GUEST_CUSTOMER_KEY)).resolves.toBeNull();
    await expect(
      AsyncStorage.getItem(GUEST_CUSTOMER_TOKEN_KEY),
    ).resolves.toBeNull();
  });
});
