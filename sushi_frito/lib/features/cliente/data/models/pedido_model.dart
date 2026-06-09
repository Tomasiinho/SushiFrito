class PedidoModel {
  PedidoModel({
    required this.id,
    required this.estado,
    required this.metodoPago,
    required this.total,
    required this.esProgramado,
    this.bloqueHorario,
    required this.items,
  });

  final String id;
  final String estado;
  final String metodoPago;
  final int total;
  final bool esProgramado;
  final String? bloqueHorario;
  final List<Map<String, dynamic>> items;

  factory PedidoModel.fromJson(Map<String, dynamic> json) {
    return PedidoModel(
      id: json['id'] as String,
      estado: json['estado'] as String,
      metodoPago: json['metodoPago'] as String,
      total: json['total'] is int
          ? json['total'] as int
          : int.tryParse(json['total'].toString()) ?? 0,
      esProgramado: json['esProgramado'] as bool,
      bloqueHorario: json['bloqueHorario'] != null
          ? json['bloqueHorario'] as String
          : null,
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => Map<String, dynamic>.from(item as Map))
              .toList() ??
          <Map<String, dynamic>>[],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'estado': estado,
      'metodoPago': metodoPago,
      'total': total,
      'esProgramado': esProgramado,
      'bloqueHorario': bloqueHorario,
      'items': items,
    };
  }
}
