import { useCallback, useEffect, useState } from "react";

import { ensureGuestCustomer } from "@/api/guests";
import {
  configureNotificationHandler,
  registerForPushNotifications,
} from "@/notifications/push";
import {
  clearActiveOrder,
  loadActiveOrder,
  saveActiveOrder,
  shouldClearActiveOrder,
} from "@/store/active-order-storage";
import { hydrateCartStore } from "@/store/cart-store";
import type { OrderDto } from "@/types/shared";
import {
  loadGuestCustomerSession,
  saveGuestCustomerSession,
} from "@/utils/guest";
import { createClientId } from "@/utils/id";

export type BootState =
  | { status: "loading" }
  | {
      status: "ready";
      customerId: string;
      customerToken: string | null;
      activeOrder: OrderDto | null;
    };

export type UseAppBootstrapResult = {
  bootState: BootState;
  updateActiveOrder: (order: OrderDto | null) => void;
};

const bootstrapDelay = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 600);
  });

export function useAppBootstrap(): UseAppBootstrapResult {
  const [bootState, setBootState] = useState<BootState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async (): Promise<void> => {
      configureNotificationHandler();
      const minimumDelay = bootstrapDelay();

      try {
        const storedGuestSession = await loadGuestCustomerSession();
        const [activeOrder, guestSession] = await Promise.all([
          loadActiveOrder(),
          ensureGuestCustomer(storedGuestSession).catch(() => null),
          hydrateCartStore(),
          minimumDelay,
        ]);
        const customerId =
          guestSession?.customerId ??
          storedGuestSession?.customerId ??
          createClientId();
        const customerToken =
          guestSession?.customerToken ?? storedGuestSession?.customerToken ?? null;

        if (guestSession !== null) {
          await saveGuestCustomerSession(guestSession);
        }

        void registerForPushNotifications(customerId);

        if (!cancelled) {
          setBootState({
            activeOrder,
            customerId,
            customerToken,
            status: "ready",
          });
        }
      } catch {
        await minimumDelay;

        if (!cancelled) {
          setBootState({
            activeOrder: null,
            customerId: createClientId(),
            customerToken: null,
            status: "ready",
          });
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateActiveOrder = useCallback((order: OrderDto | null): void => {
    const nextOrder = order && !shouldClearActiveOrder(order) ? order : null;

    setBootState((current) =>
      current.status === "ready"
        ? { ...current, activeOrder: nextOrder }
        : current,
    );

    if (nextOrder) {
      void saveActiveOrder(nextOrder);
      return;
    }

    void clearActiveOrder();
  }, []);

  return { bootState, updateActiveOrder };
}
