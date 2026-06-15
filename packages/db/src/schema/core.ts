import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    role: text("role").default("customer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_phone_idx").on(table.phone),
    index("users_email_idx").on(table.email),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    price: integer("price").notNull(),
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_available_idx").on(table.isAvailable),
  ],
);

export const addons = pgTable(
  "addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("addons_available_idx").on(table.isAvailable)],
);

export const kitchenSettings = pgTable("kitchen_settings", {
  id: text("id").default("default").primaryKey(),
  paused: boolean("paused").default(false).notNull(),
  pauseReason: text("pause_reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pickupZones = pgTable(
  "pickup_zones",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("pickup_zones_active_idx").on(table.isActive, table.sortOrder),
  ],
);

export const pickupBlocks = pgTable(
  "pickup_blocks",
  {
    id: text("id").primaryKey(),
    zoneId: text("zone_id")
      .references(() => pickupZones.id, { onDelete: "cascade" })
      .notNull(),
    label: text("label").notNull(),
    subtitle: text("subtitle").notNull(),
    start: text("start_time").notNull(),
    end: text("end_time").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("pickup_blocks_zone_idx").on(
      table.zoneId,
      table.isActive,
      table.sortOrder,
    ),
  ],
);
