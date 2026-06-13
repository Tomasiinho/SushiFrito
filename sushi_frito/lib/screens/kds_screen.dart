import 'package:flutter/material'; // <-- ESTA LÍNEA ES LA QUE SANA TODOS LOS ERRORES
import '../services/api_service.dart';

class KdsScreen extends StatefulWidget {
  const KdsScreen({Key? key}) : super(key: key);

  @override
  State<KdsScreen> createState() => _KdsScreenState();
}

class _KdsScreenState extends State<KdsScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<dynamic>> _futurePedidos;

  @override
  void initState() {
    super.initState();
    _refrescarPedidos();
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
              final double minutos = double.parse(pedido['minutos_transcurridos'].toString());
              final List<dynamic> items = pedido['items'];

              Color tarjetaColor = minutos > 15 ? Colors.red.shade50 : Colors.orange.shade50;
              Color bordeColor = minutos > 15 ? Colors.red : Colors.orange.shade300;

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
                        mainAxisAlignment: MainAxisAlignment.between,
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
                        '⏱️ Hace ${minutos.toStringAsFixed(0)} minutos',
                        style: TextStyle(color: Colors.grey.shade800, fontWeight: FontWeight.w500),
                      ),
                      const Divider(thickness: 1.5),
                      Expanded(
                        child: ListView.builder(
                          itemCount: items.length,
                          itemBuilder: (context, idx) {
                            final item = items[idx];
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '• ${item['cantidad']}x [Producto ID: ${item['producto_id']}]',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  if (item['notas_especiales'] != null && item['notas_especiales'].toString().isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(left: 14.0, top: 2.0),
                                      child: Text(
                                        '⚠️ Ojo: ${item['notas_especiales']}',
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