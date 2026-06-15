CREATE TABLE IF NOT EXISTS "pickup_zones" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pickup_blocks" (
  "id" text PRIMARY KEY NOT NULL,
  "zone_id" text NOT NULL REFERENCES "pickup_zones"("id") ON DELETE cascade,
  "label" text NOT NULL,
  "subtitle" text NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "pickup_zones_active_idx"
  ON "pickup_zones" USING btree ("is_active", "sort_order");

CREATE INDEX IF NOT EXISTS "pickup_blocks_zone_idx"
  ON "pickup_blocks" USING btree ("zone_id", "is_active", "sort_order");

INSERT INTO "pickup_zones" (
  "id",
  "name",
  "description",
  "is_active",
  "sort_order"
) VALUES
  (
    'upla_playa_ancha',
    'UPLA Playa Ancha',
    'Humanidades, Educacion y accesos principales de Playa Ancha.',
    true,
    10
  ),
  (
    'upla_curauma',
    'UPLA Curauma',
    'Campus Curauma y puntos cercanos para estudiantes con poco tiempo.',
    true,
    20
  ),
  (
    'upla_salud',
    'UPLA Salud',
    'Facultades y centros de practica del area salud.',
    true,
    30
  ),
  (
    'valpo_centro',
    'Valparaiso Centro',
    'Plaza Victoria, Anibal Pinto y oficinas del plan.',
    true,
    40
  ),
  (
    'valpo_puerto',
    'Puerto / Errazuriz',
    'Eje Puerto, Sotomayor y borde costero.',
    true,
    50
  )
ON CONFLICT ("id") DO UPDATE SET
  "description" = excluded."description",
  "is_active" = excluded."is_active",
  "name" = excluded."name",
  "sort_order" = excluded."sort_order",
  "updated_at" = now();

INSERT INTO "pickup_blocks" (
  "id",
  "zone_id",
  "label",
  "subtitle",
  "start_time",
  "end_time",
  "is_active",
  "sort_order"
) VALUES
  (
    'upla-humanidades-lunch',
    'upla_playa_ancha',
    'UPLA Humanidades',
    'Acceso Humanidades, ideal entre clases.',
    '12:00',
    '13:10',
    true,
    10
  ),
  (
    'upla-educacion-afternoon',
    'upla_playa_ancha',
    'UPLA Educacion',
    'Retiro rapido cerca de Educacion.',
    '15:00',
    '16:10',
    true,
    20
  ),
  (
    'upla-ciencias-evening',
    'upla_playa_ancha',
    'UPLA Ciencias',
    'Bloque tarde para salida de laboratorio.',
    '18:00',
    '19:00',
    true,
    30
  ),
  (
    'upla-curauma-lunch',
    'upla_curauma',
    'Campus Curauma',
    'Zona biblioteca y casino.',
    '12:40',
    '13:50',
    true,
    40
  ),
  (
    'upla-curauma-evening',
    'upla_curauma',
    'Curauma tarde',
    'Retiro para jornada vespertina.',
    '17:40',
    '18:40',
    true,
    50
  ),
  (
    'upla-salud-lunch',
    'upla_salud',
    'UPLA Salud',
    'Cerca de accesos principales.',
    '12:20',
    '13:20',
    true,
    60
  ),
  (
    'upla-salud-afternoon',
    'upla_salud',
    'Salud practica',
    'Bloque entre practica y clases.',
    '16:00',
    '17:00',
    true,
    70
  ),
  (
    'valpo-victoria-lunch',
    'valpo_centro',
    'Plaza Victoria',
    'Punto central para oficinas y bibliotecas.',
    '12:30',
    '13:45',
    true,
    80
  ),
  (
    'valpo-anibal-afternoon',
    'valpo_centro',
    'Anibal Pinto',
    'Retiro de tarde por el plan.',
    '15:30',
    '16:40',
    true,
    90
  ),
  (
    'valpo-centro-evening',
    'valpo_centro',
    'Centro tarde',
    'Bloque de salida oficina.',
    '18:10',
    '19:10',
    true,
    100
  ),
  (
    'valpo-puerto-lunch',
    'valpo_puerto',
    'Puerto almuerzo',
    'Retiro por eje Errazuriz.',
    '13:00',
    '14:00',
    true,
    110
  ),
  (
    'valpo-puerto-evening',
    'valpo_puerto',
    'Puerto tarde',
    'Retiro al cierre de jornada.',
    '18:30',
    '19:30',
    true,
    120
  )
ON CONFLICT ("id") DO UPDATE SET
  "end_time" = excluded."end_time",
  "is_active" = excluded."is_active",
  "label" = excluded."label",
  "sort_order" = excluded."sort_order",
  "start_time" = excluded."start_time",
  "subtitle" = excluded."subtitle",
  "updated_at" = now(),
  "zone_id" = excluded."zone_id";
