import * as Notifications from "expo-notifications";
import { PermissionStatus } from "expo";
import { Platform } from "react-native";
import Constants from "expo-constants";

import { registerPushToken } from "@/api/orders";
import type { PickupQrParams } from "@/types/navigation";
import { buildPickupQrPayload } from "@/utils/pickup-qr";

export const READY_NOTIFICATION_BODY =
  "¡Tu SushiFrito está crujiente y listo para retiro!";

export type PushRegistrationResult =
  | { status: "registered"; token: string }
  | { status: "denied" }
  | { status: "unavailable" };

const dataString = (
  data: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getExpoProjectId = (): string | null => {
  const extra = Constants.expoConfig?.extra;

  if (!isRecord(extra)) {
    return null;
  }

  const eas = extra.eas;

  if (!isRecord(eas)) {
    return null;
  }

  const projectId = eas.projectId;

  return typeof projectId === "string" && uuidPattern.test(projectId)
    ? projectId
    : null;
};

export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
  });
};

export const pickupQrUrl = (params: PickupQrParams): string =>
  buildPickupQrPayload(params);

export const notificationToPickupParams = (
  response: Notifications.NotificationResponse,
): PickupQrParams | null => {
  const data = response.notification.request.content.data;

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data;
  const type = dataString(record, "type");

  if (type !== "pickup-ready") {
    return null;
  }

  const orderId = dataString(record, "orderId");
  const pickupCode = dataString(record, "pickupCode");

  return {
    ...(orderId ? { orderId } : {}),
    ...(pickupCode ? { pickupCode } : {}),
  };
};

export const registerForPushNotifications = async (
  customerId: string,
): Promise<PushRegistrationResult> => {
  const projectId = getExpoProjectId();

  if (!projectId) {
    return { status: "unavailable" };
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("orders", {
        importance: Notifications.AndroidImportance.HIGH,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        name: "Pedidos",
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    const permission =
      existing.status === PermissionStatus.GRANTED
        ? existing
        : await Notifications.requestPermissionsAsync();

    if (permission.status !== PermissionStatus.GRANTED) {
      return { status: "denied" };
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    const platform =
      Platform.select<"android" | "ios" | "web">({
        android: "android",
        ios: "ios",
        web: "web",
      }) ?? "android";

    await registerPushToken({
      customerId: uuidPattern.test(customerId) ? customerId : null,
      deviceId: customerId,
      platform,
      token,
    });

    return { status: "registered", token };
  } catch {
    return { status: "unavailable" };
  }
};
