import 'package:flutter/material.dart';

void main() {
  runApp(const MemeDemoApp());
}

class MemeDemoApp extends StatelessWidget {
  const MemeDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: MemeDemoScreen(),
    );
  }
}

/// Simple mock screen that only loads the meme.png asset.
class MemeDemoScreen extends StatelessWidget {
  const MemeDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          color: Colors.white,
          child: Image.asset(
            'assets/images/meme.png',
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
