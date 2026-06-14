import 'package:flutter/material.dart';
import 'dart:async'; // Para el auto-refresco automático
import '../services/api_service.dart';

class KdsScreen extends StatefulWidget {
  const KdsScreen({Key? key}) : super(key: key);

  @override
  State<KdsScreen> createState() => _KdsScreenState();
}

class _KdsScreenState extends State<KdsScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<dynamic>> _futurePedidos;
  Timer? _timerRefresco; // Manejador del temporizador

  @override
  void initState() {
    super.initState();
    _refrescarPedidos();
    
    // Configuración del auto-refresco automático cada 15 segundos
    _timerRefresco = Timer.periodic(const Duration(seconds: 15), (timer) {
      _refrescarPedidos();
    });
  }

  @override
  void dispose() {
    _timerRefresco?.cancel(); // Limpiamos el timer para evitar fugas de memoria
    super.dispose();
  }

  void _refrescarPedidos() {
    setState(() {
      _futurePedidos = _apiService.obtenerPedidosActivos();
    });
  }

  void _cambiarEstado(int id, String nuevoEstado) async {
    bool exito = await _apiService.actualizarEstadoPedido(id, nuevoEstado);
    if (exito) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Pedido #$id cambiado a: $nuevoEstado 🍣'),
          backgroundColor: Colors.green,
        ),
      );
      _refrescarPedidos(); 
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error al cambiar el estado del pedido'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Panel de Cocina KDS - SushiFrito 🚀',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.orange.shade800,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _refrescarPedidos,
            tooltip: 'Actualizar comanda',
          )
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _futurePedidos,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error al cargar la cola: ${snapshot.error}'));
          } else if (snapshot.data == null || snapshot.data!.isEmpty) {
            return const Center(
              child: Text(
                'No hay pedidos pendientes en la cola. ¡Cocina limpia! ✨',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
              ),
            );
          }

          final pedidos = snapshot.data!;

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3, 
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.8, 
            ),
            itemCount: pedidos.length,
            itemBuilder: (context, index) {
              final pedido = pedidos[index];
              final int id = pedido['pedido_id'];
              final String estado = pedido['estado'];
              
              // Parseo seguro blindado contra strings largos de Postgres/Neon
              final double minutes = double.tryParse(pedido['minutos_transcurridos'].toString()) ?? 0.0;
              final List<dynamic> items = pedido['items'];

              Color tarjetaColor = minutes > 15 ? Colors.red.shade50 : Colors.orange.shade50;
              Color bordeColor = minutes > 15 ? Colors.red : Colors.orange.shade300;

              return Card(
                color: tarjetaColor,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: bordeColor, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Pedido #$id',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                          ),
                          Chip(
                            label: Text(
                              estado.toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            backgroundColor: estado == 'en_cocina' ? Colors.blue : Colors.orange.shade700,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '⏱️ Hace ${minutes.toStringAsFixed(0)} minutos',
                        style: TextStyle(color: Colors.grey.shade800, fontWeight: FontWeight.w500),
                      ),
                      const Divider(thickness: 1.5),
                      Expanded(
                        child: ListView.builder(
                          itemCount: items.length,
                          itemBuilder: (context, idx) {
                            final item = items[idx];
                            
                            // Rescatamos las notas con soporte para ambos idiomas
                            final String notas = (item['notas_especiales'] ?? item['notes_especiales'] ?? '').toString();
                            final int productoId = int.tryParse(item['producto_id'].toString()) ?? 0;
                            
                            // 🔥 TRADUCTOR DE ENTRADAS: Mapea la ID real de la base de datos con el nombre comercial
                            String nombreProducto = 'Sushi Roll [ID: $productoId]';
                            if (productoId == 1) {
                              nombreProducto = 'Avocado Roll 🥑';
                            } else if (productoId == 2) {
                              nombreProducto = 'Furai Roll 🍤';
                            } else if (productoId == 3) {
                              nombreProducto = 'Cheddar Burger Roll 🧀';
                            }

                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '• ${item['cantidad']}x $nombreProducto', // <-- Ahora muestra el nombre real traducido
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  if (notas.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(left: 14.0, top: 2.0),
                                      child: Text(
                                        '⚠️ Ojo: $notas',
                                        style: const TextStyle(
                                          fontStyle: FontStyle.italic, 
                                          color: Colors.red, 
                                          fontWeight: FontWeight.w500
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const Divider(),
                      SizedBox(
                        width: double.infinity,
                        child: _construirBotonAccion(id, estado),
                      )
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      // Botón flotante para simular las compras entrantes de la app del cliente
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          Map<String, dynamic> pedidoFantasma = {
            "usuario_id": 2, // <-- Cambiamos el cliente
            "metodo_pago": "efectivo", // <-- Cambiamos a efectivo 💵
            "total": 24800, // <-- Cambiamos el total matemático
            "es_programado": false,
            "bloque_horario": null,
            "items": [
              {
                "producto_id": 3, // <-- Empezamos con el Producto ID 3
                "cantidad": 1,
                "notes_especiales": "Sin jengibre por favor"
              },
              {
                "producto_id": 1, 
                "cantidad": 4, // <-- ¡Se pidió 4 de estos!
                "notes_especiales": "Salsa unagi extra"
              }
            ]
          };

          bool exito = await _apiService.registrarPedido(pedidoFantasma);
          if (exito) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🎉 ¡Pedido simulado insertado en la nube con éxito!'),
                backgroundColor: Colors.indigo,
              ),
            );
            _refrescarPedidos(); // Recargamos la interfaz inmediatamente
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('❌ No se pudo registrar el pedido fantasma. Revisa la consola.'),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        label: const Text('Simular Pedido Cliente', style: TextStyle(fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.add_shopping_cart),
        backgroundColor: Colors.orange.shade900,
      ),
    );
  }

  Widget _construirBotonAccion(int id, String estado) {
    if (estado == 'recibido') {
      return ElevatedButton.icon(
        onPressed: () => _cambiarEstado(id, 'en_cocina'),
        style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, padding: const EdgeInsets.all(12)),
        icon: const Icon(Icons.restaurant, color: Colors.white),
        label: const Text('Empezar a Cocinar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      );
    } else if (estado == 'en_cocina') {
      return ElevatedButton.icon(
        onPressed: () => _cambiarEstado(id, 'listo'),
        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, padding: const EdgeInsets.all(12)),
        icon: const Icon(Icons.check_circle, color: Colors.white),
        label: const Text('¡Pedido Listo!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      );
    } else if (estado == 'listo') {
      return ElevatedButton.icon(
        onPressed: () => _cambiarEstado(id, 'entregado'),
        style: ElevatedButton.styleFrom(backgroundColor: Colors.grey, padding: const EdgeInsets.all(12)),
        icon: const Icon(Icons.delivery_dining, color: Colors.white),
        label: const Text('Despachar / Entregar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      );
    }
    return const SizedBox.shrink();
  }
}