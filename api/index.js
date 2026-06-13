const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// 1. CONFIGURACIÓN INICIAL & MIDDLEWARES
app.use(cors()); // Permite que tu app de Flutter Web se conecte sin bloqueos de CORS
app.use(express.json());

// Configuración del Pool de conexión usando tus variables de entorno de Vercel/Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para la seguridad SSL de Neon
  }
});

// Ruta de diagnóstico (Para probar si la API está viva en internet)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW();');
    res.status(200).json({ status: 'healthy', database_time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 2. ENDPOINT: Registrar Pedido (UT1571)
app.post('/api/pedidos', async (req, res) => {
  const { usuario_id, metodo_pago, total, es_programado, bloque_horario, items } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Iniciamos Transacción SQL

    // Insertar encabezado del pedido
    const pedidoQuery = `
      INSERT INTO pedidos (usuario_id, estado, metodo_pago, total, es_programado, bloque_horario, creado_en)
      VALUES ($1, 'recibido', $2, $3, $4, $5, NOW())
      RETURNING id;
    `;
    const pedidoResult = await client.query(pedidoQuery, [usuario_id, metodo_pago, total, es_programado, bloque_horario]);
    const pedidoId = pedidoResult.rows[0].id;

    // Insertar el desglose de platos en detalles_pedido
    const detalleQuery = `
      INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, notas_especiales)
      VALUES ($1, $2, $3, $4);
    `;

    for (const item of items) {
      await client.query(detalleQuery, [pedidoId, item.producto_id, item.cantidad, item.notas_especiales]);
    }

    await client.query('COMMIT'); // Si todo fue bien, guardamos definitivamente
    res.status(201).json({ success: true, message: 'Pedido registrado con éxito', pedido_id: pedidoId });

  } catch (error) {
    await client.query('ROLLBACK'); // Si algo falló, revertimos todo para evitar datos fantasmas
    console.error('Error en transacción de pedido:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al procesar el pedido' });
  } finally {
    client.release();
  }
});

// 3. ENDPOINT: Obtener Pedidos para Cocina KDS (UT1572 / UT1574)
app.get('/api/pedidos/activos', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id AS pedido_id,
        p.estado,
        p.metodo_pago,
        p.total,
        p.es_programado,
        p.bloque_horario,
        p.creado_en,
        EXTRACT(EPOCH FROM (NOW() - p.creado_en))/60 AS minutos_transcurridos,
        json_agg(
          json_build_object(
            'producto_id', dp.producto_id,
            'cantidad', dp.cantidad,
            'notas_especiales', dp.notas_especiales
          )
        ) AS items
      FROM pedidos p
      LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
      WHERE p.estado != 'entregado'
      GROUP BY p.id
      ORDER BY p.creado_en ASC;
    `;
    
    const result = await pool.query(query);
    res.status(200).json({ success: true, pedidos: result.rows });
  } catch (error) {
    console.error('Error al obtener pedidos activos:', error);
    res.status(500).json({ success: false, error: 'Error al consultar la cola de cocina' });
  }
});

// 4. ENDPOINT: Actualizar Estado del Pedido desde la Tablet (UT1573 / UT1579)
app.put('/api/pedidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  const estadosValidos = ['recibido', 'en_preparacion', 'en_cocina', 'listo', 'entregado'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return res.status(400).json({ success: false, error: 'Estado de pedido no válido' });
  }

  try {
    const query = `
      UPDATE pedidos 
      SET estado = $1
      WHERE id = $2
      RETURNING id, estado;
    `;
    const result = await pool.query(query, [nuevoEstado, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Pedido actualizado a: ${nuevoEstado}`, 
      pedido: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar el estado en la base de datos' });
  }
});

module.exports = app;