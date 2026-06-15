CREATE TYPE "public"."order_status" AS ENUM('received', 'preparing', 'frying', 'ready', 'delivered', 'cancelled');
CREATE TYPE "public"."payment_method" AS ENUM('junaeb', 'debit');
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed');
CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text,
  "role" text DEFAULT 'customer' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "price" integer NOT NULL,
  "image_url" text,
  "is_available" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "addons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "price" integer NOT NULL,
  "is_available" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "customer_name" text NOT NULL,
  "customer_phone" text NOT NULL,
  "customer_email" text,
  "status" "order_status" DEFAULT 'received' NOT NULL,
  "payment_method" "payment_method" NOT NULL,
  "payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
  "subtotal" integer NOT NULL,
  "addon_total" integer DEFAULT 0 NOT NULL,
  "total" integer NOT NULL,
  "notes" text,
  "is_scheduled" boolean DEFAULT false NOT NULL,
  "scheduled_for" timestamp with time zone,
  "scheduled_block_start" text,
  "scheduled_block_end" text,
  "kds_visible" boolean DEFAULT true NOT NULL,
  "status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "product_name" text NOT NULL,
  "unit_price" integer NOT NULL,
  "quantity" integer NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order_item_addons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_item_id" uuid NOT NULL,
  "addon_id" uuid NOT NULL,
  "addon_name" text NOT NULL,
  "unit_price" integer NOT NULL,
  "quantity" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "previous_status" "order_status",
  "next_status" "order_status" NOT NULL,
  "changed_by_user_id" uuid,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "device_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid,
  "device_id" text NOT NULL,
  "token" text NOT NULL,
  "platform" "device_platform" NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notification_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid,
  "device_token_id" uuid,
  "channel" text DEFAULT 'push' NOT NULL,
  "status" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "error" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "kitchen_settings" (
  "id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
  "paused" boolean DEFAULT false NOT NULL,
  "pause_reason" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict;
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade;
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE restrict;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_device_token_id_device_tokens_id_fk" FOREIGN KEY ("device_token_id") REFERENCES "public"."device_tokens"("id") ON DELETE set null;

CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone");
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");
CREATE INDEX "products_available_idx" ON "products" USING btree ("is_available");
CREATE INDEX "addons_available_idx" ON "addons" USING btree ("is_available");
CREATE INDEX "orders_customer_created_idx" ON "orders" USING btree ("customer_id", "created_at");
CREATE INDEX "orders_kds_visible_idx" ON "orders" USING btree ("kds_visible", "status", "created_at");
CREATE INDEX "orders_scheduled_visibility_idx" ON "orders" USING btree ("is_scheduled", "kds_visible", "scheduled_for");
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");
CREATE INDEX "order_item_addons_item_idx" ON "order_item_addons" USING btree ("order_item_id");
CREATE INDEX "order_status_history_order_idx" ON "order_status_history" USING btree ("order_id", "created_at");
CREATE UNIQUE INDEX "device_tokens_token_unique" ON "device_tokens" USING btree ("token");
CREATE INDEX "device_tokens_customer_idx" ON "device_tokens" USING btree ("customer_id");
CREATE INDEX "notification_logs_order_idx" ON "notification_logs" USING btree ("order_id", "created_at");

INSERT INTO products (id, slug, name, description, category, price, image_url, sort_order) VALUES
('018f5c25-0678-7c40-a071-054a5a7f2b19', 'crunchy-valpo-roll', 'Crunchy Valpo Roll', 'Camaron furai, queso crema, palta y salsa acevichada.', 'rolls', 5200, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', 10),
('018f5c25-0678-7c40-a071-054a5a7f2b20', 'upla-furai-roll', 'UPLA Furai Roll', 'Pollo crispy, cebollin, queso crema y panko.', 'rolls', 4900, 'https://images.unsplash.com/photo-1553621042-f6e147245754', 20),
('018f5c25-0678-7c40-a071-054a5a7f2b21', 'avocado-office-roll', 'Avocado Office Roll', 'Salmon, queso crema y palta para almuerzo rapido.', 'rolls', 5900, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252', 30),
('018f5c25-0678-7c40-a071-054a5a7f2b22', 'veggie-cerro-maki', 'Veggie Cerro Maki', 'Pepino, palta, zanahoria y sesamo tostado.', 'veggie', 4300, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56', 40),
('018f5c25-0678-7c40-a071-054a5a7f2b23', 'box-estudiante', 'Box Estudiante', '12 piezas mixtas con salsa de soya y palitos.', 'boxes', 7200, 'https://images.unsplash.com/photo-1563612116625-3012372fccce', 50),
('018f5c25-0678-7c40-a071-054a5a7f2b24', 'gyozas-express', 'Gyozas Express', '6 gyozas doradas para compartir en oficina.', 'sides', 3900, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c', 60)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO addons (id, name, price, sort_order) VALUES
('028f5c25-0678-7c40-a071-054a5a7f2b19', 'Salsa acevichada', 500, 10),
('028f5c25-0678-7c40-a071-054a5a7f2b20', 'Soya extra', 0, 20),
('028f5c25-0678-7c40-a071-054a5a7f2b21', 'Palitos', 0, 30),
('028f5c25-0678-7c40-a071-054a5a7f2b22', 'Jengibre extra', 300, 40)
ON CONFLICT DO NOTHING;

INSERT INTO kitchen_settings (id, paused) VALUES ('default', false) ON CONFLICT (id) DO NOTHING;
