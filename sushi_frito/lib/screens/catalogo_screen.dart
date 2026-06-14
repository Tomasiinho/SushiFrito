import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'carrito_screen.dart';
import 'seguimiento_screen.dart';

class CatalogoScreen extends StatefulWidget {
  const CatalogoScreen({Key? key}) : super(key: key);

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  final ApiService _apiService = ApiService();
  
  final List<Map<String, dynamic>> _productosSimulados = [
    {
      "id": 1,
      "nombre": "Avocado Roll 🥑",
      "descripcion": "Salmón, queso crema, envuelto en palta.",
      "precio": 6500,
    },
    {
      "id": 2,
      "nombre": "Furai Roll 🍤",
      "descripcion": "Camarón, queso crema, cebollín, frito en panko.",
      "precio": 5900,
    },
    {
      "id": 3,
      "nombre": "Cheddar Burger Roll 🧀",
      "descripcion": "Pollo, tocino, bañado en salsa cheddar frito.",
      "precio": 7200,
    },
  ];

  final Map<int, int> _carrito = {};

  void _agregarAlCarrito(int id) {
    setState(() {
      _carrito[id] = (_carrito[id] ?? 0) + 1;
    });
  }

  void _quitarDelCarrito(int id) {
    if (!_carrito.containsKey(id)) return;
    setState(() {
      if (_carrito[id] == 1) {
        _carrito.remove(id);
      } else {
        _carrito[id] = _carrito[id]! - 1;
      }
    });
  }

  int _obtenerTotalContador() {
    return _carrito.values.fold(0, (sum, cantidad) => sum + cantidad);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '¡Pide tu SushiFrito! 🍣🔥',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.orange.shade800,
        actions: [
          // 🔥 UT 1576: BOTÓN DE SEGUIMIENTO AGREGADO AL CATÁLOGO
          IconButton(
            icon: const Icon(Icons.radar, color: Colors.white),
            tooltip: 'Seguir mi Pedido',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SeguimientoScreen(ejecutarAutoCarga: true),
                ),
              );
            },
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart, color: Colors.white, size: 28),
                onPressed: () async {
                  if (_carrito.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('¡Añade productos antes de ir al carrito! 🍣')),
                    );
                    return;
                  }
                  
                  final realizoCompra = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CarritoScreen(
                        carrito: _carrito,
                        productosDisponibles: _productosSimulados,
                      ),
                    ),
                  );

                  if (realizoCompra == true) {
                    setState(() {});
                  }
                },
              ),
              if (_obtenerTotalContador() > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                    child: Text(
                      '${_obtenerTotalContador()}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
            ],
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _productosSimulados.length,
        itemBuilder: (context, index) {
          final prod = _productosSimulados[index];
          final int id = prod['id'];
          final int cantidadEnCarro = _carrito[id] ?? 0;

          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8),
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          prod['nombre'],
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          prod['descripcion'],
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '\$${prod['precio']}',
                          style: TextStyle(color: Colors.orange.shade900, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  cantidadEnCarro == 0
                      ? ElevatedButton(
                          onPressed: () => _agregarAlCarrito(id),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade800),
                          child: const Text('Añadir', style: TextStyle(color: Colors.white)),
                        )
                      : Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline, color: Colors.orange),
                              onPressed: () => _quitarDelCarrito(id),
                            ),
                            Text(
                              '$cantidadEnCarro',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline, color: Colors.orange),
                              onPressed: () => _agregarAlCarrito(id),
                            ),
                          ],
                        ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}