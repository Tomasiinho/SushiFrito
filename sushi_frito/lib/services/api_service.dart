import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Mientras pruebas en tu máquina local, usamos localhost.
  // Cuando desplieguen el backend en Vercel, solo cambias esta línea por tu link de internet.
  static const String baseUrl = 'http://localhost:3000/api';

  // 1. Obtener Pedidos Activos para la Pantalla de Cocina KDS (UT1572)
  Future<List<dynamic>> obtenerPedidosActivos() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/pedidos/activos'));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['pedidos']; // Retorna la lista de pedidos con sus desgloses
        }
      }
      return [];
    } catch (e) {
      print('Error al conectar con la cola de cocina: $e');
      return [];
    }
  }

  // 2. Actualizar Estado del Pedido desde la Tablet (UT1573 / UT1579)
  Future<bool> actualizarEstadoPedido(int pedidoId, String nuevoEstado) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/pedidos/$pedidoId/estado'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'nuevoEstado': nuevoEstado}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      print('Error al cambiar estado del pedido $pedidoId: $e');
      return false;
    }
  }
}