import 'package:flutter/material.dart';

class ClienteScreen extends StatefulWidget {
  const ClienteScreen({Key? key}) : super(key: key);

  @override
  State<ClienteScreen> createState() => _ClienteScreenState();
}

class _ClienteScreenState extends State<ClienteScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _syncController;
  late final AnimationController _pulseController;
  bool _scheduledOrder = false;
  int _selectedTimeIndex = 0;

  final List<_MenuProduct> _products = const [
    _MenuProduct(
      title: 'Crunchy Roll',
      price: '4.200',
      ingredients: 'Arroz, salmón, palta, tempura',
    ),
    _MenuProduct(
      title: 'Ebi Tempura',
      price: '5.000',
      ingredients: 'Camaron, salsa spicy, cebollín',
    ),
    _MenuProduct(
      title: 'Katsu Bowl',
      price: '4.800',
      ingredients: 'Pollo empanizado, arroz, salsa tonkatsu',
    ),
    _MenuProduct(
      title: 'Veggie Maki',
      price: '3.900',
      ingredients: 'Zanahoria, pepino, palta, sésamo',
    ),
    _MenuProduct(
      title: 'Salmon Nikkei',
      price: '5.300',
      ingredients: 'Salmón, mayo cítrica, cebolla crispy',
    ),
    _MenuProduct(
      title: 'Sushi Box UPLA',
      price: '6.200',
      ingredients: '12 piezas mixtas + salsa',
    ),
  ];

  final List<String> _scheduleOptions = [
    '13:00 - 13:15',
    '14:00 - 14:15',
    '14:30 - 14:45',
  ];

  @override
  void initState() {
    super.initState();
    _syncController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _syncController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return Scaffold(
      backgroundColor: const Color(0xFF0B0B0C),
      appBar: AppBar(
        backgroundColor: colorScheme.background,
        elevation: 0,
        title: const Text('SushiFrito'),
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              children: [
                Icon(
                  Icons.wifi,
                  color: Colors.white.withOpacity(0.85),
                ),
                const SizedBox(width: 10),
                FadeTransition(
                  opacity: Tween<double>(begin: 0.4, end: 1.0)
                      .animate(CurvedAnimation(
                    parent: _syncController,
                    curve: Curves.easeInOut,
                  )),
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      color: Color(0xFF2EFF56),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            sliver: SliverGrid.builder(
              itemCount: _products.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.78,
              ),
              itemBuilder: (context, index) {
                final product = _products[index];
                return _ProductCard(product: product);
              },
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            sliver: SliverToBoxAdapter(
              child: _ScheduledOrderSection(
                scheduledOrder: _scheduledOrder,
                onChanged: (value) {
                  setState(() => _scheduledOrder = value);
                },
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverToBoxAdapter(
              child: AnimatedSize(
                duration: const Duration(milliseconds: 350),
                curve: Curves.easeInOut,
                child: _scheduledOrder
                    ? Padding(
                        padding: const EdgeInsets.only(top: 12.0, bottom: 16.0),
                        child: SizedBox(
                          height: 56,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _scheduleOptions.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 12),
                            itemBuilder: (context, index) {
                              final isSelected = index == _selectedTimeIndex;
                              return ChoiceChip(
                                label: Text(_scheduleOptions[index]),
                                selected: isSelected,
                                onSelected: (_) {
                                  setState(() {
                                    _selectedTimeIndex = index;
                                  });
                                },
                                selectedColor:
                                    const Color(0xFFFF5A00).withOpacity(0.16),
                                backgroundColor: const Color(0xFF161618),
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.white : Colors.grey[400],
                                  fontWeight:
                                      isSelected ? FontWeight.w700 : FontWeight.w500,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  side: BorderSide(
                                    color: isSelected
                                        ? const Color(0xFFFF5A00)
                                        : Colors.white12,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
            sliver: SliverToBoxAdapter(
              child: _OrderProgressStepper(
                pulseAnimation: _pulseController,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: const SizedBox(height: 90),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: SizedBox(
            height: 56,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF5A00),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              onPressed: () {
                // Acción de pago
              },
              child: const Text(
                'Proceder al Pago',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({
    required this.product,
  });

  final _MenuProduct product;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Text(
                product.title.substring(0, 1),
                style: const TextStyle(
                  color: Colors.white24,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            product.title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            product.ingredients,
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 13,
            ),
          ),
          const Spacer(),
          Text(
            'CLP ${product.price}',
            style: const TextStyle(
              color: Color(0xFFFF5A00),
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _ScheduledOrderSection extends StatelessWidget {
  const _ScheduledOrderSection({
    required this.scheduledOrder,
    required this.onChanged,
  });

  final bool scheduledOrder;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Pedido Programado',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Selecciona un bloque de horario UPLA para tu entrega.',
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: scheduledOrder,
            activeColor: const Color(0xFFFF5A00),
            activeTrackColor: const Color(0xFFFF5A00).withOpacity(0.35),
            inactiveThumbColor: Colors.grey[300],
            inactiveTrackColor: Colors.white12,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _OrderProgressStepper extends StatelessWidget {
  const _OrderProgressStepper({
    required this.pulseAnimation,
  });

  final Animation<double> pulseAnimation;

  @override
  Widget build(BuildContext context) {
    final textStyle = TextStyle(
      color: Colors.grey[300],
      fontSize: 12,
      fontWeight: FontWeight.w600,
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF161618),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              _StepperItem(
                label: 'Recibido',
                isCompleted: true,
                icon: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
              _StepperDivider(),
              _StepperItem(
                label: 'En Preparación',
                isCompleted: true,
                icon: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
              _StepperDivider(),
              _StepperItem(
                label: 'En Cocina',
                isActive: true,
                icon: ScaleTransition(
                  scale: Tween<double>(begin: 0.92, end: 1.08)
                      .animate(CurvedAnimation(
                    parent: pulseAnimation,
                    curve: Curves.easeInOut,
                  )),
                  child: const Icon(
                    Icons.local_fire_department,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
              _StepperDivider(),
              _StepperItem(
                label: 'Listo para Retirar',
                isPending: true,
                icon: const Icon(Icons.circle, color: Colors.white24, size: 10),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Recibido', style: TextStyle(color: Colors.white70, fontSize: 12)),
              Text('Preparación', style: TextStyle(color: Colors.white70, fontSize: 12)),
              Text('Cocina', style: TextStyle(color: Color(0xFFFF5A00), fontSize: 12, fontWeight: FontWeight.w700)),
              Text('Retiro', style: TextStyle(color: Colors.white38, fontSize: 12)),
            ],
          )
        ],
      ),
    );
  }
}

class _StepperItem extends StatelessWidget {
  const _StepperItem({
    required this.label,
    this.isCompleted = false,
    this.isActive = false,
    this.isPending = false,
    required this.icon,
  });

  final String label;
  final bool isCompleted;
  final bool isActive;
  final bool isPending;
  final Widget icon;

  @override
  Widget build(BuildContext context) {
    final background = isCompleted
        ? const Color(0xFF2ECC71)
        : isActive
            ? const Color(0xFFFF5A00)
            : const Color(0xFF27272A);

    return Container(
      width: 46,
      height: 46,
      decoration: BoxDecoration(
        color: background,
        shape: BoxShape.circle,
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: const Color(0xFFFF5A00).withOpacity(0.25),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: icon,
    );
  }
}

class _StepperDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 2,
        color: Colors.white12,
      ),
    );
  }
}

class _MenuProduct {
  const _MenuProduct({
    required this.title,
    required this.price,
    required this.ingredients,
  });

  final String title;
  final String price;
  final String ingredients;
}
