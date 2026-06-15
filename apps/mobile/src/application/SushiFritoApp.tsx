import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

import { MobileRouter } from "@/application/MobileRouter";
import { useAppBootstrap } from "@/application/use-app-bootstrap";
import { useCartNotice } from "@/application/use-cart-notice";
import { CartNotice } from "@/components/CartNotice";
import { TabBar } from "@/components/TabBar";
import { parsePickupQrDeepLink } from "@/navigation/deep-links";
import { tabRouteForRoute } from "@/navigation/routes";
import { notificationToPickupParams } from "@/notifications/push";
import { useCartStore } from "@/store/cart-store";
import { colors } from "@/styles/theme";
import type {
  AppRouteName,
  PickupQrParams,
  TabRouteName,
} from "@/types/navigation";

export function SushiFritoApp(): ReactElement {
  const [route, setRoute] = useState<AppRouteName>("home");
  const [hasEnteredMenu, setHasEnteredMenu] = useState(false);
  const [pickupQrParams, setPickupQrParams] = useState<PickupQrParams>({});
  const totals = useCartStore((state) => state.totals);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const { bootState, updateActiveOrder } = useAppBootstrap();
  const { cartNotice, clearCartNotice, showProductAdded } = useCartNotice();

  const showPickupQr = useCallback((params: PickupQrParams): void => {
    setPickupQrParams(params);
    setHasEnteredMenu(true);
    setRoute("pickupQr");
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const params = notificationToPickupParams(response);

        if (params !== null) {
          showPickupQr(params);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [showPickupQr]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const params = parsePickupQrDeepLink(event.url);

      if (params !== null) {
        showPickupQr(params);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showPickupQr]);

  useEffect(() => {
    const restoreInitialIntent = async (): Promise<void> => {
      const url = await Linking.getInitialURL();

      if (url) {
        const params = parsePickupQrDeepLink(url);

        if (params !== null) {
          showPickupQr(params);
          return;
        }
      }

      const notificationResponse = Notifications.getLastNotificationResponse();
      const params =
        notificationResponse === null
          ? null
          : notificationToPickupParams(notificationResponse);

      if (params !== null) {
        showPickupQr(params);
      }
    };

    void restoreInitialIntent();
  }, [showPickupQr]);

  const navigate = useCallback((nextRoute: AppRouteName): void => {
    if (nextRoute !== "home") {
      setHasEnteredMenu(true);
    }

    setRoute(nextRoute);
  }, []);

  const navigateTab = useCallback((nextRoute: TabRouteName): void => {
    setHasEnteredMenu(true);
    setRoute(nextRoute);
  }, []);

  const openPickupQr = useCallback(
    (params: PickupQrParams): void => {
      showPickupQr(params);
    },
    [showPickupQr],
  );

  const activeTabRoute = tabRouteForRoute(route);
  const visibleTabRoute =
    bootState.status === "ready" && hasEnteredMenu ? activeTabRoute : null;

  return (
    <View style={styles.safeArea}>
      <View style={styles.content}>
        <MobileRouter
          bootState={bootState}
          navigate={navigate}
          openPickupQr={openPickupQr}
          pickupQrParams={pickupQrParams}
          replaceItems={replaceItems}
          route={route}
          showProductAdded={showProductAdded}
          totals={totals}
          updateActiveOrder={updateActiveOrder}
        />
      </View>
      {cartNotice ? (
        <CartNotice
          message={cartNotice}
          onOpenCart={() => {
            clearCartNotice();
            navigate("cart");
          }}
        />
      ) : null}
      {visibleTabRoute ? (
        <TabBar
          activeRoute={visibleTabRoute}
          cartItemCount={totals.itemCount}
          onChange={navigateTab}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
