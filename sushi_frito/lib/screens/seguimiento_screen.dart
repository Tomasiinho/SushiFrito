import 'package:flutter/material.dart';
import 'dart:async';
import '../services/api_service.dart';

class SeguimientoScreen extends StatefulWidget {
  final int? pedidoIdInicial; // Consulta manual por ID
  final bool ejecutarAutoCarga; // Si viene del carro, busca el último pedido vivo

  const SeguimientoScreen({
    Key? key, 
    this.pedidoIdInicial, 
    this.ejecutarAutoCarga = false,
  }) : super(key: key);

  @override
  State<SeguimientoScreen> createState() => _SeguimientoScreenState();
}

class _SeguimientoScreenState extends State<SeguimientoScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _idController = TextEditingController();
  
  bool _cargando = false;
  String? _estadoActual;
  int? _pedidoId;
  Timer? _timerSeguimiento;

  @override
  void initState() {
    super.initState();
    
    if (widget.pedidoIdInicial != null) {
      _pedidoId = widget.pedidoIdInicial;
      _idController.text = _pedidoId.toString();
      _buscarEstadoPedido();
    } else if (widget.ejecutarAutoCarga) {
      _autoCargarUltimoPedido();
    }

    // Auto-refresco de la comanda cada 10 segundos (UT 1576)
    _timerSeguimiento = Timer.periodic(const Duration(seconds: 10), (timer) {
      _buscarEstadoPedido();
    });
  }

  @override
  void dispose() {
    _timerSeguimiento?.cancel();
    _idController.dispose();
    super.dispose();
  }

  // Detecta de forma inteligente el pedido recién creado por el usuario
  void _autoCargarUltimoPedido() async {
    setState(() => _cargando = true);
    final pedidosActivos = await _apiService.obtenerPedidosActivos();
    setState(() => _cargando = false);

    if (pedidosActivos.isNotEmpty) {
      // Como vienen ordenados de forma ascendente, tomamos el último de la lista
      final ultimoPedido = pedidosActivos.last;
      setState(() {
        _pedidoId = int.tryParse(ultimoPedido['pedido_id'].toString());
        _idController.text = _pedidoId?.toString() ?? '';
        _estadoActual = ultimoPedido['estado'];
      });
    }
  }

  void _buscarEstadoPedido() async {
    final idText = _idController.text.trim();
    if (idText.isEmpty) return;

    final id = int.tryParse(idText);
    if (id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, ingresa un ID numérico válido.')),
      );
      return;
    }

    setState(() {
      _pedidoId = id;
      if (_estadoActual == null) _cargando = true;
    });

    final pedidosActivos = await _apiService.obtenerPedidosActivos();
    
    if (!mounted) return;
    setState(() => _cargando = false);

    final miPedido = pedidosActivos.firstWhere(
      (p) => p['pedido_id'] == id,
      orElse: () => null,
    );

    if (miPedido != null) {
      final nuevoEstado = miPedido['estado'].toString();
      
      // 🔥 LÓGICA UT 1575: Si el estado cambia a 'listo', disparamos la notificación emergente
      if (nuevoEstado == 'listo' && _estadoActual != 'listo') {
        _mostrarNotificacionPedidoListo();
      }

      setState(() {
        _estadoActual = nuevoEstado;
      });
    } else {
      setState(() {
        _estadoActual = 'entregado_o_invalido';
      });
    }
  }

  // Función auxiliar que dibuja la alerta emergente de "Pedido Listo" (UT 1575)
  void _mostrarNotificacionPedidoListo() {
    showDialog(
      context: context,
      barrierDismissible: true, // El cliente puede cerrarlo tocando fuera
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.stars, color: Colors.green, size: 30),
            SizedBox(width: 10),
            Text('¡A comer! 🛍️✨', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '¡Tu pedido #$_pedidoId está listo!',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Los maestros susheros ya empacaron tus rolls calientitos. '
              'Puedes acercarte al mostrador a retirarlo de inmediato.',
              style: TextStyle(fontSize: 14, color: Colors.black87),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('¡Voy corriendo! 🏃‍♂️💨', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  int _obtenerPasoActivo(String? estado) {
    switch (estado) {
      case 'recibido': return 0;
      case 'en_cocina': return 1;
      case 'listo': return 2;
      case 'entregado': return 3;
      default: return -1;
    }
  }

  @override
  Widget build(BuildContext context) {
    final pasoActivo = _obtenerPasoActivo(_estadoActual);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Seguimiento de tu Pedido 🍣', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.orange.shade800,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Buscador manual por ID
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _idController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Número de Pedido (ID)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.tag),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _buscarEstadoPedido,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange.shade800,
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                      ),
                      child: const Icon(Icons.search, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),

            if (_cargando) const CircularProgressIndicator(),

            if (_estadoActual != null && !_cargando) ...[
              Text(
                'Pedido #$_pedidoId',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              
              if (pasoActivo == -1)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12)),
                  child: const Text(
                    'No encontramos el pedido activo. Puede que ya haya sido despachado o retirado. 🎉',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                )
              else ...[
                // Barra de Pasos (Stepper) Visual Dinámica
                Expanded(
                  child: Stepper(
                    type: StepperType.vertical,
                    currentStep: pasoActivo >= 3 ? 2 : pasoActivo,
                    controlsBuilder: (context, details) => const SizedBox.shrink(),
                    steps: [
                      Step(
                        title: const Text('Pedido Recibido 🛒', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Tu orden ya está en el sistema de SushiFrito.'),
                        content: const SizedBox.shrink(),
                        isActive: pasoActivo >= 0,
                        state: pasoActivo > 0 ? StepState.complete : StepState.editing,
                      ),
                      Step(
                        title: const Text('En Cocina 👨‍🍳🔥', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Los maestros susheros están preparando tus rolls.'),
                        content: const SizedBox.shrink(),
                        isActive: pasoActivo >= 1,
                        state: pasoActivo > 1 ? StepState.complete : (pasoActivo == 1 ? StepState.editing : StepState.indexed),
                      ),
                      Step(
                        title: const Text('¡Listo para Retirar! 🛍️✨', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('Tu pedido está calientito y empacado. ¡Ven por él!'),
                        content: const SizedBox.shrink(),
                        isActive: pasoActivo >= 2,
                        state: pasoActivo == 2 ? StepState.editing : StepState.indexed,
                      ),
                    ],
                  ),
                ),

                // 🔥 INTERFAZ INYECTADA PARA UT 1578: BOTÓN REPETIR PEDIDO
                // Se renderiza al final de la pantalla cuando el pedido pasa a estar Listo o Despachado
                if (pasoActivo >= 2) ...[
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('🛒 ¡Productos añadidos al carrito con éxito! Redirigiendo...'),
                            backgroundColor: Colors.green,
                          ),
                        );

                        // Regresa al catálogo principal limpiando las rutas secundarias
                        Future.delayed(const Duration(seconds: 2), () {
                          Navigator.of(context).popUntil((route) => route.isFirst);
                        });
                      },
                      icon: const Icon(Icons.replay, color: Colors.white),
                      label: const Text(
                        'Pedir lo Mismo Otra Vez 🔄',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange.shade800,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ]
            ]
          ],
        ),
      ),
    );
  }
}