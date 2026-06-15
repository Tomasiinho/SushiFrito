import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { addons, products, users } from "./core";
import { orderStatusEnum, paymentMethodEnum, paymentStatusEnum } from "./enums";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),
    status: orderStatusEnum("status").default("received").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("pending")
      .notNull(),
    subtotal: integer("subtotal").notNull(),
    addonTotal: integer("addon_total").default(0).notNull(),
    total: integer("total").notNull(),
    notes: text("notes"),
    isScheduled: boolean("is_scheduled").default(false).notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    scheduledBlockStart: text("scheduled_block_start"),
    scheduledBlockEnd: text("scheduled_block_end"),
    scheduledZone: text("scheduled_zone"),
    kdsVisible: boolean("kds_visible").default(true).notNull(),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("orders_customer_created_idx").on(table.customerId, table.createdAt),
    index("orders_kds_visible_idx").on(
      table.kdsVisible,
      table.status,
      table.createdAt,
    ),
    index("orders_scheduled_visibility_idx").on(
      table.isScheduled,
      table.kdsVisible,
      table.scheduledFor,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    productName: text("product_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const orderItemAddons = pgTable(
  "order_item_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderItemId: uuid("order_item_id")
      .references(() => orderItems.id, { onDelete: "cascade" })
      .notNull(),
    addonId: uuid("addon_id")
      .references(() => addons.id, { onDelete: "restrict" })
      .notNull(),
    addonName: text("addon_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("order_item_addons_item_idx").on(table.orderItemId)],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    previousStatus: orderStatusEnum("previous_status"),
    nextStatus: orderStatusEnum("next_status").notNull(),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_status_history_order_idx").on(table.orderId, table.createdAt),
  ],
);
