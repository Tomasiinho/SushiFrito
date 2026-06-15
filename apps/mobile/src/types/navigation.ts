export type AppRouteName =
  | "home"
  | "catalog"
  | "cart"
  | "schedule"
  | "tracking"
  | "history"
  | "pickupQr";

export type TabRouteName = "catalog" | "cart" | "tracking" | "history";

export type PickupQrParams = {
  orderId?: string;
  pickupCode?: string;
};
