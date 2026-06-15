import * as Linking from "expo-linking";

import type { PickupQrParams } from "@/types/navigation";

const queryValue = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const parsePickupQrDeepLink = (url: string): PickupQrParams | null => {
  const parsed = Linking.parse(url);

  if (parsed.path !== "pickup-qr" && parsed.hostname !== "pickup-qr") {
    return null;
  }

  const orderId = queryValue(parsed.queryParams?.orderId);
  const pickupCode = queryValue(parsed.queryParams?.pickupCode);

  return {
    ...(orderId ? { orderId } : {}),
    ...(pickupCode ? { pickupCode } : {}),
  };
};
