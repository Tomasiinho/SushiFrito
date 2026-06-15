import { createOrderSchema } from "@/contracts/shared";
import type { CartItem } from "@/types/cart";
import type { CreateOrderPayload, PaymentMethod } from "@/types/shared";

export type ScheduleSelection =
  | {
      enabled: false;
      date?: string;
      blockId?: string;
    }
  | {
      blockEnd: string;
      enabled: true;
      date: string;
      blockId: string;
      blockStart: string;
      zone: string;
    };

export type BuildCreateOrderPayloadInput = {
  items: CartItem[];
  customerId: string;
  paymentMethod: PaymentMethod;
  schedule: ScheduleSelection;
};

const addonIdsByOption: Readonly<Record<string, string>> = {
  acevichada: "028f5c25-0678-7c40-a071-054a5a7f2b19",
  soya: "028f5c25-0678-7c40-a071-054a5a7f2b20",
  spicy: "028f5c25-0678-7c40-a071-054a5a7f2b19",
  teriyaki: "028f5c25-0678-7c40-a071-054a5a7f2b20",
};

const chopsticksAddonId = "028f5c25-0678-7c40-a071-054a5a7f2b21";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const isUuid = (value: string): boolean => uuidPattern.test(value);

const customerPhoneForId = (customerId: string): string => {
  const identifier = customerId.replace(/-/gu, "").slice(0, 18).padEnd(18, "0");

  return `sf${identifier}`;
};

const addonsForCartItem = (
  item: CartItem,
): CreateOrderPayload["items"][number]["addons"] => {
  const quantities = new Map<string, number>();

  for (const sauce of item.sauces) {
    const addonId = addonIdsByOption[sauce];

    if (addonId) {
      quantities.set(addonId, (quantities.get(addonId) ?? 0) + 1);
    }
  }

  if (item.chopsticks) {
    quantities.set(
      chopsticksAddonId,
      (quantities.get(chopsticksAddonId) ?? 0) + 1,
    );
  }

  return [...quantities.entries()].map(([addonId, quantity]) => ({
    addonId,
    quantity,
  }));
};

const scheduledPayload = (
  schedule: ScheduleSelection,
): CreateOrderPayload["scheduled"] => {
  if (!schedule.enabled) {
    return null;
  }

  return {
    blockEnd: schedule.blockEnd,
    blockStart: schedule.blockStart,
    date: schedule.date,
    zone: schedule.zone,
  };
};

export const buildCreateOrderPayload = (
  input: BuildCreateOrderPayloadInput,
): CreateOrderPayload => {
  const payload: CreateOrderPayload = {
    customerId: isUuid(input.customerId) ? input.customerId : null,
    customerName: "Cliente SushiFrito",
    customerPhone: customerPhoneForId(input.customerId),
    customerEmail: null,
    notes: null,
    paymentMethod: input.paymentMethod,
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes ?? null,
      addons: addonsForCartItem(item),
    })),
    scheduled: scheduledPayload(input.schedule),
  };

  return createOrderSchema.parse(payload);
};
