import AsyncStorage from "@react-native-async-storage/async-storage";

import { createClientId } from "@/utils/id";

export const GUEST_CUSTOMER_KEY = "sushifrito.guestCustomerId";
export const GUEST_CUSTOMER_TOKEN_KEY = "sushifrito.guestCustomerToken";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export type StoredGuestCustomerSession = {
  customerId: string;
  customerToken: string | null;
};

export const loadGuestCustomerSession =
  async (): Promise<StoredGuestCustomerSession | null> => {
    const [customerId, customerToken] = await Promise.all([
      AsyncStorage.getItem(GUEST_CUSTOMER_KEY),
      AsyncStorage.getItem(GUEST_CUSTOMER_TOKEN_KEY),
    ]);

    if (customerId === null || !uuidPattern.test(customerId)) {
      await Promise.all([
        AsyncStorage.removeItem(GUEST_CUSTOMER_KEY),
        AsyncStorage.removeItem(GUEST_CUSTOMER_TOKEN_KEY),
      ]);
      return null;
    }

    return {
      customerId,
      customerToken:
        customerToken !== null && customerToken.length >= 16
          ? customerToken
          : null,
    };
  };

export const saveGuestCustomerSession = async (
  session: StoredGuestCustomerSession,
): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(GUEST_CUSTOMER_KEY, session.customerId),
    session.customerToken === null
      ? AsyncStorage.removeItem(GUEST_CUSTOMER_TOKEN_KEY)
      : AsyncStorage.setItem(GUEST_CUSTOMER_TOKEN_KEY, session.customerToken),
  ]);
};

export const clearGuestCustomerSession = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(GUEST_CUSTOMER_KEY),
    AsyncStorage.removeItem(GUEST_CUSTOMER_TOKEN_KEY),
  ]);
};

export const getOrCreateGuestCustomerId = async (): Promise<string> => {
  const session = await loadGuestCustomerSession();

  if (session !== null) {
    return session.customerId;
  }

  return createClientId();
};
