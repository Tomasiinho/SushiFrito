DROP INDEX IF EXISTS "users_phone_unique";

CREATE INDEX IF NOT EXISTS "users_phone_idx"
  ON "users" USING btree ("phone");
