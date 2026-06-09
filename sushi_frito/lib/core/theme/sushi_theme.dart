import 'package:flutter/material.dart';

class SushiTheme {
  static ThemeData get darkMode {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFFFF5A00),      // Naranja corporativo SushiFrito
        secondary: Color(0xFF9A9A9A),    // Gris secundario
        surface: Color(0xFF161618),      // Fondo de las tarjetas (Cards)
        error: Color(0xFFE74C3C),        // Rojo de alerta crítica (UT1574)
      ),
      scaffoldBackgroundColor: const Color(0xFF0B0B0C), // Fondo de pantalla
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontFamily: 'Inter', color: Colors.white),
        titleLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}