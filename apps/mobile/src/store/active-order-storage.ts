import AsyncStorage from "@react-native-async-storage/async-storage";

import { parseActiveOrderFromStorage } from "@/store/storage-schemas";
import type { OrderDto, OrderStatus } from "@/types/shared";

export const ACTIVE_ORDER_STORAGE_KEY = "sushifrito.activeOrder";

const terminalStatuses: readonly OrderStatus[] = ["delivered", "cancelled"];

export const shouldClearActiveOrder = (order: OrderDto): boolean =>
  terminalStatuses.includes(order.status);

export const loadActiveOrder = async (): Promise<OrderDto | null> => {
  const raw = await AsyncStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = parseActiveOrderFromStorage(JSON.parse(raw) as unknown);

    if (!parsed || shouldClearActiveOrder(parsed)) {
      await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    return null;
  }
};

export const saveActiveOrder = async (order: OrderDto): Promise<void> => {
  if (shouldClearActiveOrder(order)) {
    await clearActiveOrder();
    return;
  }

  await AsyncStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(order));
};

export const clearActiveOrder = async (): Promise<void> => {
  await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
};
