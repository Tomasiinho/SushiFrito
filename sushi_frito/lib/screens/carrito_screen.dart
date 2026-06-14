import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'seguimiento_screen.dart';

class CarritoScreen extends StatefulWidget {
  final Map<int, int> carrito; // Recibe { producto_id: cantidad }
  final List<Map<String, dynamic>> productosDisponibles;

  const CarritoScreen({
    Key? key,
    required this.carrito,
    required this.productosDisponibles,
  }) : super(key: key);

  @override
  State<CarritoScreen> createState() => _CarritoScreenState();
}

class _CarritoScreenState extends State<CarritoScreen> {
  final ApiService _apiService = ApiService();
  String _metodoPago = 'junaeb'; // Método por defecto 💳
  bool _enviando = false;

  // Variables para UT 1577 (Pedidos Programados)
  bool _esProgramado = false;
  String _bloqueHorarioSeleccionado = '19:00 a 19:30';

  final List<String> _bloquesHorarios = [
    '19:00 a 19:30',
    '19:30 a 20:00',
    '20:00 a 20:30',
    '20:30 a 21:00',
    '21:00 a 21:30',
  ];

  int _calcularTotal() {
    int total = 0;
    widget.carrito.forEach((id, cantidad) {
      final prod = widget.productosDisponibles.firstWhere((p) => p['id'] == id);
      total += (prod['precio'] as int) * cantidad;
    });
    return total;
  }

  void _enviarPedidoACocina() async {
    if (widget.carrito.isEmpty) return;

    setState(() => _enviando = true);

    // Mapeamos los ítems al formato exacto de la base de datos
    List<Map<String, dynamic>> itemsMapeados = [];
    widget.carrito.forEach((id, cantidad) {
      itemsMapeados.add({
        "producto_id": id,
        "cantidad": cantidad,
        "notes_especiales": "Pedido Web", // Compatibilidad base de datos
        "notas_especiales": "Pedido Web", // Compatibilidad backend
      });
    });

    // Armamos el JSON completo para Node/Vercel (UT 1577)
    Map<String, dynamic> nuevoPedido = {
      "usuario_id": 1, 
      "metodo_pago": _metodoPago,
      "total": _calcularTotal(),
      "es_programado": _esProgramado,
      "bloque_horario": _esProgramado ? _bloqueHorarioSeleccionado : "Inmediato",
      "items": itemsMapeados
    };

    // Despachamos a la nube
    bool exito = await _apiService.registrarPedido(nuevoPedido);

    setState(() => _enviando = false);

    if (exito) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Text('¡Pedido en Marcha! 🍣🔥'),
          content: const Text(
            'Tu pedido ha sido enviado directo a la cocina.\n\n'
            '💡 Nota: Tu panel de seguimiento se configurará de forma automática con tu orden actual.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                widget.carrito.clear(); // Vaciamos el carro de compras
                Navigator.pop(ctx); // Cerramos el modal de alerta
                
                // Transición directa a la pantalla de Seguimiento (UT 1576)
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SeguimientoScreen(ejecutarAutoCarga: true),
                  ),
                );
              },
              child: const Text('Ver Seguimiento', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('❌ Hubo un error al procesar el pago. Inténtalo de nuevo.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tu Carrito 🛒', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.orange.shade800,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: widget.carrito.isEmpty
          ? const Center(child: Text('Tu carrito está vacío. ¡Añade unos buenos rolls! 🥑'))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: widget.carrito.length,
                    itemBuilder: (context, index) {
                      final id = widget.carrito.keys.elementAt(index);
                      final cantidad = widget.carrito[id]!;
                      final prod = widget.productosDisponibles.firstWhere((p) => p['id'] == id);
                      final subtotal = prod['precio'] * cantidad;

                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(vertical: 8),
                        title: Text('${prod['nombre']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        subtitle: Text('$cantidad x \$${prod['precio']}'),
                        trailing: Text('\$$subtotal', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -3))],
                  ),
                  child: Column(
                    children: [
                      // Fila de Método de Pago
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Método de Pago:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          DropdownButton<String>(
                            value: _metodoPago,
                            items: const [
                              DropdownMenuItem(value: 'junaeb', child: Text('Tarjeta Junaeb 💳')),
                              DropdownMenuItem(value: 'efectivo', child: Text('Efectivo 💵')),
                              DropdownMenuItem(value: 'transbank', child: Text('Débito/Crédito 🏧')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _metodoPago = val);
                            },
                          )
                        ],
                      ),
                      const Divider(height: 16),

                      // --- INTERFAZ INTERACTIVA AGREGADA PARA UT 1577 ---
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '¿Cuándo quieres tu pedido? ⏰',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: RadioListTile<bool>(
                                  title: const Text('Para ahora', style: TextStyle(fontSize: 13)),
                                  value: false,
                                  groupValue: _esProgramado,
                                  activeColor: Colors.orange.shade800,
                                  contentPadding: EdgeInsets.zero,
                                  onChanged: (val) => setState(() => _esProgramado = val!),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile<bool>(
                                  title: const Text('Programar', style: TextStyle(fontSize: 13)),
                                  value: true,
                                  groupValue: _esProgramado,
                                  activeColor: Colors.orange.shade800,
                                  contentPadding: EdgeInsets.zero,
                                  onChanged: (val) => setState(() => _esProgramado = val!),
                                ),
                              ),
                            ],
                          ),
                          if (_esProgramado) ...[
                            const SizedBox(height: 4),
                            DropdownButtonFormField<String>(
                              value: _bloqueHorarioSeleccionado,
                              decoration: const InputDecoration(
                                labelText: 'Selecciona un bloque horario',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              items: _bloquesHorarios.map((String bloque) {
                                return DropdownMenuItem<String>(
                                  value: bloque,
                                  child: Text(bloque, style: const TextStyle(fontSize: 14)),
                                );
                              }).toList(),
                              onChanged: (String? nuevoBloque) {
                                setState(() {
                                  _bloqueHorarioSeleccionado = nuevoBloque!;
                                });
                              },
                            ),
                          ],
                        ],
                      ),
                      // --------------------------------------------------

                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('TOTAL:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                          Text('\$${_calcularTotal()}', style: TextStyle(color: Colors.orange.shade900, fontWeight: FontWeight.bold, fontSize: 22)),
                        ],
                      ),
                      const SizedBox(height: 15),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _enviando ? null : _enviarPedidoACocina,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange.shade800,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: _enviando
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Text('Confirmar y Enviar Pedido 🚀', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  ),
                )
              ],
            ),
    );
  }
}