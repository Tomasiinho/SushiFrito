ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "scheduled_zone" text;

CREATE INDEX IF NOT EXISTS "orders_scheduled_zone_idx" ON "orders" USING btree ("scheduled_zone");

INSERT INTO products (id, slug, name, description, category, price, image_url, sort_order) VALUES
('a1d4b40b-da7d-423f-88fb-1bf775f2f884', 'humanidades-teriyaki-roll', 'Humanidades Teriyaki Roll', 'Pollo furai, queso crema, cebollin y teriyaki para retiro en Playa Ancha.', 'rolls', 5200, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252', 70),
('d8caea93-927f-4039-8ada-f3484a40ee09', 'educacion-crispy-roll', 'Educacion Crispy Roll', 'Camaron tempura, palta y panko para pausa entre clases.', 'rolls', 5600, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56', 80),
('009df874-baf6-4b4b-9f3f-3048044350f1', 'curauma-salmon-bowl', 'Curauma Salmon Bowl', 'Base de arroz, salmon, palta, pepino y soya ligera para campus Curauma.', 'boxes', 6800, 'https://images.unsplash.com/photo-1607301405390-d831c242f59c', 90),
('44941d40-c5fe-4761-9f0c-d6bd9217fdf7', 'curauma-veggie-tempura', 'Curauma Veggie Tempura', 'Roll veggie con champinon tempura, palta y sesamo tostado.', 'veggie', 4900, 'https://images.unsplash.com/photo-1617196034738-26c5f7c977ce', 100),
('d0034914-f3e3-49b7-a0ad-51ee2bc4371c', 'salud-avocado-roll', 'Salud Avocado Roll', 'Salmon, queso crema y cobertura de palta para retiros cerca de practica.', 'rolls', 6100, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56', 110),
('f3df07cc-32ae-4295-8ada-b105274fd050', 'centro-express-handroll', 'Centro Express Handroll', 'Handroll de pollo crispy con queso crema para pausa corta en el plan.', 'handrolls', 3900, 'https://images.unsplash.com/photo-1563612116625-3012372fccce', 120),
('3456df46-a409-470e-8770-8fb877af46f8', 'anibal-pinto-furai', 'Anibal Pinto Furai', 'Camaron furai, cebollin y salsa spicy para retiro por Anibal Pinto.', 'rolls', 5800, 'https://images.unsplash.com/photo-1553621042-f6e147245754', 130),
('ab5bc1f6-2837-4afd-ad60-61b59327da72', 'plaza-victoria-box', 'Plaza Victoria Box', '18 piezas mixtas para compartir en oficina o biblioteca.', 'boxes', 9800, 'https://images.unsplash.com/photo-1563612116625-3012372fccce', 140),
('a6e79fcf-e9cf-4380-847e-22d1241838f2', 'puerto-crispy-box', 'Puerto Crispy Box', '24 piezas fritas con dos salsas para equipos del borde costero.', 'boxes', 12900, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', 150),
('b2929239-395e-49b0-a5d0-7991dc896c0c', 'plan-ejecutivo-18', 'Plan Ejecutivo 18', 'Mix de salmon, pollo furai y veggie pensado para almuerzo de oficina.', 'boxes', 8900, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252', 160),
('ad7dbd4f-d04e-4eb1-b9fb-e33a6947569b', 'gyozas-valpo', 'Gyozas Valpo', '6 gyozas doradas con soya para sumar al pedido.', 'sides', 3900, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c', 170),
('b5e50956-60ac-46ea-b8f9-e612cbedd376', 'bebida-yuzu-lata', 'Bebida Yuzu Lata', 'Bebida citrica fria para acompanar rolls fritos.', 'sides', 1900, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', 180)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_available = true,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
