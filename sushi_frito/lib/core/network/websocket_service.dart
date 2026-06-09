import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  WebSocketService();

  static const Duration _reconnectDelay = Duration(seconds: 3);

  final StreamController<Map<String, dynamic>> _pedidosController =
      StreamController<Map<String, dynamic>>.broadcast();
  final List<String> _pendingOutgoing = [];

  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  String? _url;
  bool _isConnecting = false;
  bool _isDisposed = false;

  /// Exposes the incoming pedidos stream for ClienteScreen and KdsScreen.
  Stream<Map<String, dynamic>> get streamPedidos => _pedidosController.stream;

  /// Conecta el servicio al backend WebSocket y mantiene la reconexión.
  Future<void> conectar(String url) async {
    if (_isDisposed) return;
    _url = url;

    if (_channel != null) {
      return;
    }

    await _openChannel();
  }

  Future<void> _openChannel() async {
    if (_isDisposed || _isConnecting || _url == null) return;

    _isConnecting = true;
    try {
      final uri = Uri.parse(_url!);
      _channel = WebSocketChannel.connect(uri);
      _channel!.stream.listen(
        _handleIncomingMessage,
        onError: _handleConnectionError,
        onDone: _handleConnectionClosed,
        cancelOnError: true,
      );

      _flushPendingMessages();
    } catch (_) {
      _scheduleReconnect();
    } finally {
      _isConnecting = false;
    }
  }

  void _handleIncomingMessage(dynamic message) {
    if (_isDisposed) return;

    try {
      final payload = message is String ? jsonDecode(message) : message;
      if (payload is Map<String, dynamic>) {
        _pedidosController.add(payload);
        return;
      }
      if (payload is List) {
        for (final item in payload) {
          if (item is Map<String, dynamic>) {
            _pedidosController.add(item);
          }
        }
      }
    } catch (_) {
      // Ignorar mensajes no JSON o con formato inesperado.
    }
  }

  void _handleConnectionError(Object error, StackTrace stackTrace) {
    if (_isDisposed) return;
    _cleanupChannel();
    _scheduleReconnect();
  }

  void _handleConnectionClosed() {
    if (_isDisposed) return;
    _cleanupChannel();
    _scheduleReconnect();
  }

  void _cleanupChannel() {
    try {
      _channel?.sink.close();
    } catch (_) {
      // Ignorar errores de cierre.
    }
    _channel = null;
  }

  void _scheduleReconnect() {
    if (_isDisposed || _reconnectTimer != null || _url == null) return;

    _reconnectTimer = Timer(_reconnectDelay, () {
      _reconnectTimer = null;
      if (_isDisposed) return;
      _openChannel();
    });
  }

  void _flushPendingMessages() {
    if (_channel == null || _pendingOutgoing.isEmpty) return;

    for (final message in List<String>.from(_pendingOutgoing)) {
      try {
        _channel?.sink.add(message);
        _pendingOutgoing.remove(message);
      } catch (_) {
        break;
      }
    }
  }

  /// Envía al backend un cambio de estado de pedido.
  Future<void> enviarCambioEstado(
    String pedidoId,
    String nuevoEstado,
  ) async {
    final payload = jsonEncode(
      {
        'type': 'cambio_estado',
        'pedidoId': pedidoId,
        'nuevoEstado': nuevoEstado,
      },
    );

    if (_channel != null) {
      try {
        _channel!.sink.add(payload);
        return;
      } catch (_) {
        _cleanupChannel();
      }
    }

    _pendingOutgoing.add(payload);
    _scheduleReconnect();
  }

  /// Cierra el servicio y libera recursos.
  Future<void> dispose() async {
    _isDisposed = true;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _cleanupChannel();
    await _pedidosController.close();
  }
}
