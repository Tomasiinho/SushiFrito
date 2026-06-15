import { and, eq } from "drizzle-orm";

import { deviceTokenSchema, type DeviceTokenInput } from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { deviceTokens, notificationLogs } from "../schema";
import { ensureDeviceCustomerUser } from "./users";

export type DevicePushTarget = {
  id: string;
  token: string;
};

export type NotificationLogInput = {
  orderId: string;
  deviceTokenId: string;
  status: "sent" | "failed" | "skipped";
  title: string;
  body: string;
  error?: string | null;
  metadata?: Record<string, unknown>;
};

export async function registerDeviceToken(
  db: SushiFritoDb,
  input: DeviceTokenInput,
): Promise<{ id: string; token: string }> {
  const parsed = deviceTokenSchema.parse(input);
  const now = new Date();
  await ensureDeviceCustomerUser(db, parsed);
  const [existing] = await db
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.token, parsed.token))
    .limit(1);

  if (existing !== undefined) {
    const [updated] = await db
      .update(deviceTokens)
      .set({
        customerId: parsed.customerId ?? null,
        deviceId: parsed.deviceId,
        isActive: true,
        lastSeenAt: now,
        platform: parsed.platform,
        updatedAt: now,
      })
      .where(eq(deviceTokens.id, existing.id))
      .returning({ id: deviceTokens.id, token: deviceTokens.token });

    return updated ?? { id: existing.id, token: existing.token };
  }

  const [created] = await db
    .insert(deviceTokens)
    .values({
      customerId: parsed.customerId ?? null,
      deviceId: parsed.deviceId,
      platform: parsed.platform,
      token: parsed.token,
    })
    .returning({ id: deviceTokens.id, token: deviceTokens.token });

  if (created === undefined) {
    throw new Error("Device token registration failed");
  }

  return created;
}

export async function getActiveDevicePushTargets(
  db: SushiFritoDb,
  customerId: string | null,
): Promise<DevicePushTarget[]> {
  if (customerId === null) {
    return [];
  }

  return db
    .select({ id: deviceTokens.id, token: deviceTokens.token })
    .from(deviceTokens)
    .where(
      and(
        eq(deviceTokens.customerId, customerId),
        eq(deviceTokens.isActive, true),
      ),
    );
}

export async function deactivateDeviceToken(
  db: SushiFritoDb,
  deviceTokenId: string,
): Promise<void> {
  await db
    .update(deviceTokens)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(deviceTokens.id, deviceTokenId));
}

export async function recordNotificationLog(
  db: SushiFritoDb,
  input: NotificationLogInput,
): Promise<void> {
  await db.insert(notificationLogs).values({
    body: input.body,
    deviceTokenId: input.deviceTokenId,
    error: input.error ?? null,
    metadata: input.metadata ?? {},
    orderId: input.orderId,
    status: input.status,
    title: input.title,
  });
}
