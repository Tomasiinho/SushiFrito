-- SushiFrito: esquema relacional optimizado para Vercel Postgres

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('cliente', 'sushiman', 'administrador')),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio INT NOT NULL CHECK (precio >= 0),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de insumos
CREATE TABLE IF NOT EXISTS insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    stock_actual NUMERIC(10, 2) NOT NULL CHECK (stock_actual >= 0),
    stock_critico NUMERIC(10, 2) NOT NULL CHECK (stock_critico >= 0),
    unidad_medida TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla intermedia producto_insumos para consumo de stock
CREATE TABLE IF NOT EXISTS producto_insumos (
    producto_id UUID NOT NULL,
    insumo_id UUID NOT NULL,
    cantidad_requerida NUMERIC(10, 2) NOT NULL CHECK (cantidad_requerida > 0),
    PRIMARY KEY (producto_id, insumo_id),
    CONSTRAINT fk_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_insumo
        FOREIGN KEY (insumo_id)
        REFERENCES insumos (id)
        ON DELETE CASCADE
);

-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('recibido', 'en_preparacion', 'en_cocina', 'listo', 'entregado')),
    metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('junaeb', 'debito')),
    total INT NOT NULL CHECK (total >= 0),
    es_programado BOOLEAN NOT NULL DEFAULT FALSE,
    bloque_horario VARCHAR(64),
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)
        ON DELETE RESTRICT
);

-- Details of each order line item
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    notas_especiales TEXT,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_producto_detalle
        FOREIGN KEY (producto_id)
        REFERENCES productos (id)
        ON DELETE RESTRICT
);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- Trigger para mantener actualizado actualizado_en cuando cambia estado
CREATE OR REPLACE FUNCTION actualizar_pedido_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        NEW.actualizado_en := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_pedido_en ON pedidos;

CREATE TRIGGER trg_actualizar_pedido_en
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION actualizar_pedido_actualizado_en();
