const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    estado VARCHAR(30) DEFAULT 'recibido',
    metodo_pago VARCHAR(20) NOT NULL,
    total INT NOT NULL,
    es_programado BOOLEAN DEFAULT FALSE,
    bloque_horario VARCHAR(50),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.detalles_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    notes_especiales TEXT
);

CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en ON public.pedidos(creado_en ASC) WHERE estado != 'entregado';
`;

async function ejecutar() {
  try {
    await client.connect();
    console.log("Conectando directo a Neon sin intermediarios...");
    await client.query(sql);
    console.log("¡Tablas creadas con éxito total en el espacio público! 🚀🍣");
  } catch (err) {
    console.error("Error al crear las tablas:", err.message);
  } finally {
    await client.end();
  }
}

ejecutar();