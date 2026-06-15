import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./core";
import { orders } from "./orders";
import { devicePlatformEnum } from "./enums";

export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => users.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    token: text("token").notNull(),
    platform: devicePlatformEnum("platform").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("device_tokens_token_unique").on(table.token),
    index("device_tokens_customer_idx").on(table.customerId),
  ],
);

export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    deviceTokenId: uuid("device_token_id").references(() => deviceTokens.id, { onDelete: "set null" }),
    channel: text("channel").default("push").notNull(),
    status: text("status").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    error: text("error"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("notification_logs_order_idx").on(table.orderId, table.createdAt)],
);
