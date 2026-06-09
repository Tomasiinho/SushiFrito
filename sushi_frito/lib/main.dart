import 'package:flutter/material.dart';
import 'core/theme/sushi_theme.dart';
void main() {
  runApp(const SushiFritoApp());
}

class SushiFritoApp extends StatelessWidget {
  const SushiFritoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SushiFrito',
      debugShowCheckedModeBanner: false,
      theme: SushiTheme.darkMode, // Carga nuestra paleta de colores oficial
      home: const Scaffold(
        body: Center(
          child: Text(
            'SushiFrito: Inicializado con éxito 🚀',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}