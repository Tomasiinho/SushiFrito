import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // URL base apuntando directo al servidor de Vercel en producción
  static const String baseUrl = "https://sushifrito-backend.vercel.app/api";

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

  // 3. NUEVO: Registrar un pedido nuevo desde la App del Cliente (UT1571)
  Future<bool> registrarPedido(Map<String, dynamic> datosPedido) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pedidos'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(datosPedido),
      );

      // El backend de Node suele responder con 201 (Created) o 200 cuando inserta con éxito
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] == true;
      }
      print('Fallo en la respuesta del servidor al registrar: ${response.body}');
      return false;
    } catch (e) {
      print('Error de conexión al intentar registrar el pedido: $e');
      return false;
    }
  }
}