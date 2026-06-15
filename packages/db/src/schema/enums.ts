import { pgEnum } from "drizzle-orm/pg-core";

import {
  devicePlatformValues,
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from "@sushifrito/shared";

export const orderStatusEnum = pgEnum("order_status", orderStatusValues);
export const paymentMethodEnum = pgEnum("payment_method", paymentMethodValues);
export const paymentStatusEnum = pgEnum("payment_status", paymentStatusValues);
export const devicePlatformEnum = pgEnum("device_platform", devicePlatformValues);
