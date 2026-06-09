import 'package:flutter/material.dart';

class KdsScreen extends StatefulWidget {
  const KdsScreen({Key? key}) : super(key: key);

  @override
  State<KdsScreen> createState() => _KdsScreenState();
}

class _KdsScreenState extends State<KdsScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _blinkController;
  final List<_KitchenOrder> _orders = const [
    _KitchenOrder(
      id: 'KDS-001',
      purchaseTime: '12:42',
      elapsedMinutes: 5,
      rolls: ['Dragon Roll', 'California Roll'],
      modifications: ['SIN queso crema'],
    ),
    _KitchenOrder(
      id: 'KDS-002',
      purchaseTime: '12:33',
      elapsedMinutes: 8,
      rolls: ['Spicy Tuna Roll'],
      modifications: ['EXTRA jalapeño'],
    ),
    _KitchenOrder(
      id: 'KDS-003',
      purchaseTime: '12:20',
      elapsedMinutes: 13,
      rolls: ['Ebi Tempura Roll', 'Katsu Bowl'],
      modifications: ['SIN salsa tonkatsu'],
    ),
    _KitchenOrder(
      id: 'KDS-004',
      purchaseTime: '12:46',
      elapsedMinutes: 6,
      rolls: ['Veggie Maki', 'Sushi Box UPLA'],
      modifications: ['SIN cebolla crispy'],
    ),
    _KitchenOrder(
      id: 'KDS-005',
      purchaseTime: '12:29',
      elapsedMinutes: 10,
      rolls: ['Salmon Nikkei'],
      modifications: ['SIN mayonesa'],
    ),
    _KitchenOrder(
      id: 'KDS-006',
      purchaseTime: '12:15',
      elapsedMinutes: 15,
      rolls: ['Crunchy Roll', 'Sushi Box UPLA'],
      modifications: ['SIN palta'],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _blinkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _blinkController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0B0C),
      body: SafeArea(
        child: Column(
          children: [
            _KdsHeader(),
            const SizedBox(height: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: GridView.count(
                  crossAxisCount: 3,
                  childAspectRatio: 1.16,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  children: _orders
                      .map(
                        (order) => _KdsOrderCard(
                          order: order,
                          blinkAnimation: _blinkController,
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KdsHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFF161618),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                _MetricLabel(
                  label: 'Pedidos en Cola',
                  value: '8',
                  valueColor: Colors.white,
                ),
                _MetricLabel(
                  label: 'Tiempo Promedio',
                  value: '9.5 min',
                  valueColor: Color(0xFFF1C40F),
                ),
              ],
            ),
          ),
          const SizedBox(width: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE74C3C),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
            ),
            onPressed: () {
              // Acción de pausa de alta demanda.
            },
            child: const Text(
              'Pausa por Alta Demanda',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricLabel extends StatelessWidget {
  const _MetricLabel({
    required this.label,
    required this.value,
    required this.valueColor,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[400],
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: 24,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _KdsOrderCard extends StatelessWidget {
  const _KdsOrderCard({
    required this.order,
    required this.blinkAnimation,
  });

  final _KitchenOrder order;
  final Animation<double> blinkAnimation;

  Color get _borderColor {
    if (order.elapsedMinutes > 12) {
      return const Color(0xFFE74C3C);
    }
    if (order.elapsedMinutes >= 7) {
      return const Color(0xFFF1C40F);
    }
    return const Color(0xFF2ECC71);
  }

  bool get _isOverdue => order.elapsedMinutes > 12;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: blinkAnimation,
      builder: (context, child) {
        final borderColor = _isOverdue
            ? _borderColor.withOpacity(0.4 + (blinkAnimation.value * 0.6))
            : _borderColor;
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF161618),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: borderColor,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(16),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              order.id,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          if (_isOverdue)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE74C3C),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                '${order.elapsedMinutes}m',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Compra: ${order.purchaseTime}',
                        style: TextStyle(
                          color: Colors.grey[300],
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Rolls:',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      ...order.rolls.map(
                        (roll) => Text(
                          '• $roll',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            height: 1.3,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Modificaciones:',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      ...order.modifications.map(
                        (mod) => Text(
                          mod,
                          style: const TextStyle(
                            color: Color(0xFFFF5A00),
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isOverdue
                                ? const Color(0xFFB73E3E)
                                : const Color(0xFF2E2E34),
                            padding: const EdgeInsets.symmetric(
                              vertical: 14,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          onPressed: () {
                            // Acción rápida de finalizar orden.
                          },
                          child: const Text(
                            'Finalizar / Listo',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _KitchenOrder {
  const _KitchenOrder({
    required this.id,
    required this.purchaseTime,
    required this.elapsedMinutes,
    required this.rolls,
    required this.modifications,
  });

  final String id;
  final String purchaseTime;
  final int elapsedMinutes;
  final List<String> rolls;
  final List<String> modifications;
}
