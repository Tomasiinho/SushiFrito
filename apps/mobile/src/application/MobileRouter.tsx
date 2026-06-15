import type { ReactNode } from "react";

import type { BootState } from "@/application/use-app-bootstrap";
import { createCartItemsFromOrder } from "@/store/repeat-order";
import { CartScreen } from "@/screens/CartScreen";
import { CatalogScreen } from "@/screens/CatalogScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { PickupQrScreen } from "@/screens/PickupQrScreen";
import { ScheduleScreen } from "@/screens/ScheduleScreen";
import { TrackingScreen } from "@/screens/TrackingScreen";
import type { CartItem, CartTotals } from "@/types/cart";
import type { AppRouteName, PickupQrParams } from "@/types/navigation";
import type { OrderDto } from "@/types/shared";

export type MobileRouterProps = {
  bootState: BootState;
  route: AppRouteName;
  totals: CartTotals;
  pickupQrParams: PickupQrParams;
  navigate: (route: AppRouteName) => void;
  openPickupQr: (params: PickupQrParams) => void;
  replaceItems: (items: CartItem[]) => void;
  showProductAdded: (productName: string) => void;
  updateActiveOrder: (order: OrderDto | null) => void;
};

export function MobileRouter({
  bootState,
  navigate,
  openPickupQr,
  pickupQrParams,
  replaceItems,
  route,
  showProductAdded,
  totals,
  updateActiveOrder
}: MobileRouterProps): ReactNode {
  if (bootState.status === "loading") {
    return <LoadingScreen />;
  }

  const { activeOrder, customerId, customerToken } = bootState;

  switch (route) {
    case "home":
      return (
        <HomeScreen
          activeOrder={activeOrder}
          itemCount={totals.itemCount}
          onContinueCart={() => {
            navigate("cart");
          }}
          onStartOrder={() => {
            navigate("catalog");
          }}
          onTrackOrder={() => {
            navigate("tracking");
          }}
          onOrderChanged={updateActiveOrder}
          subtotal={totals.subtotal}
        />
      );
    case "cart":
      return (
        <CartScreen
          onBrowseMenu={() => {
            navigate("catalog");
          }}
          onCheckout={() => {
            navigate("schedule");
          }}
        />
      );
    case "schedule":
      return (
        <ScheduleScreen
          customerId={customerId}
          customerToken={customerToken}
          onOrderCreated={(order) => {
            updateActiveOrder(order);
            navigate("tracking");
          }}
        />
      );
    case "tracking":
      return (
        <TrackingScreen
          activeOrder={activeOrder}
          onOrderChanged={updateActiveOrder}
          onPickupQr={openPickupQr}
          onStartOrder={() => {
            navigate("catalog");
          }}
        />
      );
    case "history":
      return (
        <HistoryScreen
          customerId={customerId}
          customerToken={customerToken}
          onRepeatOrder={(order) => {
            replaceItems(createCartItemsFromOrder(order));
            navigate("cart");
          }}
          onStartOrder={() => {
            navigate("catalog");
          }}
        />
      );
    case "pickupQr":
      return <PickupQrScreen params={pickupQrParams} />;
    case "catalog":
    default:
      return <CatalogScreen onProductAdded={showProductAdded} />;
  }
}
