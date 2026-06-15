import type { CreateOrderInput, DeviceTokenInput } from "@sushifrito/shared";

import type { SushiFritoDb } from "../client";
import { users } from "../schema";

type TransactionDb = Parameters<Parameters<SushiFritoDb["transaction"]>[0]>[0];

export async function ensureOrderCustomerUser(
  db: SushiFritoDb | TransactionDb,
  input: CreateOrderInput,
): Promise<void> {
  if (input.customerId === null || input.customerId === undefined) {
    return;
  }

  const now = new Date();

  await db
    .insert(users)
    .values({
      email: input.customerEmail ?? null,
      id: input.customerId,
      name: input.customerName,
      phone: input.customerPhone,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        email: input.customerEmail ?? null,
        name: input.customerName,
        phone: input.customerPhone,
        updatedAt: now,
      },
      target: users.id,
    });
}

export async function ensureDeviceCustomerUser(
  db: SushiFritoDb,
  input: DeviceTokenInput,
): Promise<void> {
  if (input.customerId === null || input.customerId === undefined) {
    return;
  }

  const now = new Date();

  await db
    .insert(users)
    .values({
      id: input.customerId,
      name: "Cliente SushiFrito",
      phone: `device:${input.deviceId}`,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        updatedAt: now,
      },
      target: users.id,
    });
}

export async function ensureGuestCustomerUser(
  db: SushiFritoDb,
  customerId: string,
): Promise<void> {
  const now = new Date();

  await db
    .insert(users)
    .values({
      id: customerId,
      name: "Invitado SushiFrito",
      phone: `guest:${customerId}`,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        updatedAt: now,
      },
      target: users.id,
    });
}
