import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class StartScreen extends StatelessWidget {
  const StartScreen({super.key});

  // Brand Colors
  static const Color osombaOrange = Color(0xFFEF7D00);
  static const Color forestGreen = Color(0xFF3A703F);
  static const Color actionGreen = Color(0xFF2A9D15);
  static const Color pureWhite = Color(0xFFFFFFFF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: osombaOrange,
      body: Stack(
        children: [
          // Background Decorative Shape
          Positioned(
            top: -100,
            right: -50,
            child: _buildTopDecorativeShape(),
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 60),
                  
                  // Logo
                  _buildLogo(),
                  
                  const SizedBox(height: 40),
                  
                  // Main Headline
                  const Text(
                    'Discover, buy, and\nsell locally.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: pureWhite,
                      fontSize: 42,
                      fontWeight: FontWeight.bold,
                      height: 1.1,
                    ),
                  ),
                  
                  const SizedBox(height: 50),
                  
                  // Feature List
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          _buildFeatureItem(
                            Icons.assignment_outlined,
                            'Track your orders',
                            "Check order status and track, change, or return items you've purchased.",
                          ),
                          const SizedBox(height: 25),
                          _buildFeatureItem(
                            Icons.shopping_bag_outlined,
                            'Shop from your favorites',
                            'Browse past purchases and discover everyday essentials from local sellers.',
                          ),
                          const SizedBox(height: 25),
                          _buildFeatureItem(
                            Icons.list_alt_outlined,
                            'Save your items',
                            'Create lists with the items you want — for now or later.',
                          ),
                          const SizedBox(height: 25),
                          _buildFeatureItem(
                            Icons.storefront_outlined,
                            'Open your own Boutique',
                            'Create your online boutique and start selling locally with Osomba.',
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Continue Button
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to login/authenticator
                        // Since Authenticator is the top-level guard, 
                        // navigating to any protected route will trigger it.
                        context.go('/marketplace');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: actionGreen,
                        foregroundColor: pureWhite,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: const Text(
                        'Continue',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return SizedBox(
      width: double.infinity,
      child: Image.asset(
        'assets/images/logo_text_white_orange.png',
        height: 320,
        fit: BoxFit.contain,
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            border: Border.all(color: pureWhite, width: 1.5),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: pureWhite, size: 28),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: pureWhite,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(
                  color: pureWhite.withValues(alpha: 0.9),
                  fontSize: 15,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTopDecorativeShape() {
    return Container(
      width: 300,
      height: 300,
      decoration: const BoxDecoration(
        color: forestGreen,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(300),
        ),
      ),
    );
  }
}
