import 'package:flutter/material.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class LoginScreen extends StatefulWidget {
  final AuthenticatorState state;
  const LoginScreen({super.key, required this.state});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Brand Colors
  static const Color osombaOrange = Color(0xFFEF7D00);
  static const Color forestGreen = Color(0xFF3A703F);
  static const Color actionGreen = Color(0xFF2A9D15);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const List<_FeatureInfo> _featureDetails = [
    _FeatureInfo(
      assetPath: 'assets/images/feature_track_orders.png',
      title: 'Track your orders',
      description: "Check order status and track, change, or return items you've purchased.",
    ),
    _FeatureInfo(
      assetPath: 'assets/images/feature_shop_favorites.png',
      title: 'Shop from your favorites',
      description: 'Browse past purchases and discover everyday essentials from local sellers.',
    ),
    _FeatureInfo(
      assetPath: 'assets/images/feature_save_items.png',
      title: 'Save your items',
      description: 'Create lists with the items you want — for now or later.',
    ),
    _FeatureInfo(
      assetPath: 'assets/images/feature_open_boutique.png',
      title: 'Open your own Boutique',
      description: 'Create your online boutique and start selling locally with Osomba.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: osombaOrange,
      body: Stack(
        children: [
          // Background Decorative Shapes (Approximated)
          Positioned(
            top: -50,
            right: -30,
            child: _buildLeafShape(),
          ),
          Positioned(
            bottom: -100,
            left: -50,
            child: _buildBlobShape(),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 24),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 900;
                  return Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: isWide ? 1200 : 520,
                      ),
                      child: isWide
                          ? Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(child: _buildFeaturePanel()),
                                Container(
                                  width: 1,
                                  height: 560,
                                  margin: const EdgeInsets.symmetric(horizontal: 24),
                                  color: pureWhite.withValues(alpha: 0.3),
                                ),
                                Expanded(child: _buildLoginCard()),
                              ],
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                _buildFeaturePanel(),
                                const SizedBox(height: 32),
                                Container(
                                  height: 1,
                                  color: pureWhite.withValues(alpha: 0.3),
                                ),
                                const SizedBox(height: 32),
                                _buildLoginCard(),
                              ],
                            ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Image.asset(
          'assets/images/logo_text_white_dark.png',
          width: 220,
        ),
      ],
    );
  }

  Widget _buildLoginCard() {
    return Theme(
      data: Theme.of(context).copyWith(
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: pureWhite,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(
              color: forestGreen,
              width: 2,
            ),
          ),
        ),
      ),
      child: AuthenticatorForm(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 40),
            _buildLogo(),
            const SizedBox(height: 20),
            _buildDivider(),
            const SizedBox(height: 32),
            _buildLabel('Email'),
            SignInFormField.username(
              key: const Key('email_field'),
            ),
            const SizedBox(height: 20),
            _buildLabel('Password'),
            SignInFormField.password(
              key: const Key('password_field'),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: widget.state.isBusy ? null : widget.state.signIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: actionGreen,
                  foregroundColor: pureWhite,
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: widget.state.isBusy
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: pureWhite,
                        ),
                      )
                    : const Text(
                        'Login',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 15),
            GestureDetector(
              onTap: () => widget.state.changeStep(AuthenticatorStep.resetPassword),
              child: const Text(
                'Forgot password?',
                style: TextStyle(
                  color: pureWhite,
                  fontSize: 14,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            const SizedBox(height: 24),
            _buildOrDivider(),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _socialButton(FontAwesomeIcons.apple),
                const SizedBox(width: 15),
                _socialButton(FontAwesomeIcons.meta),
                const SizedBox(width: 15),
                _socialButton(FontAwesomeIcons.google),
              ],
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  "Don't have an account? ",
                  style: TextStyle(color: pureWhite),
                ),
                GestureDetector(
                  onTap: () => widget.state.changeStep(AuthenticatorStep.signUp),
                  child: const Text(
                    'Sign Up',
                    style: TextStyle(
                      color: pureWhite,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturePanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 216),
        const Text(
          'Why Osomba?',
          style: TextStyle(
            color: pureWhite,
            fontSize: 30,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Discover local sellers, keep tabs on every order, and launch your own boutique.',
          style: TextStyle(
            color: pureWhite.withValues(alpha: 0.9),
            fontSize: 16,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 32),
        for (final feature in _featureDetails) ...[
          _featureTile(feature),
          const SizedBox(height: 20),
        ],
      ],
    );
  }

  Widget _featureTile(_FeatureInfo info) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: pureWhite.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: pureWhite.withValues(alpha: 0.2)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Image.asset(
              info.assetPath,
              fit: BoxFit.contain,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                info.title,
                style: const TextStyle(
                  color: pureWhite,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                info.description,
                style: TextStyle(
                  color: pureWhite.withValues(alpha: 0.9),
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: pureWhite.withValues(alpha: 0.5))),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Transform.rotate(
            angle: 0.785, // 45 degrees
            child: Container(
              width: 8,
              height: 8,
              color: pureWhite,
            ),
          ),
        ),
        Expanded(child: Container(height: 1, color: pureWhite.withValues(alpha: 0.5))),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          color: pureWhite,
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildOrDivider() {
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: pureWhite.withValues(alpha: 0.3))),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 10),
          child: Text(
            'or',
            style: TextStyle(color: pureWhite, fontSize: 14),
          ),
        ),
        Expanded(child: Container(height: 1, color: pureWhite.withValues(alpha: 0.3))),
      ],
    );
  }

  Widget _socialButton(IconData icon) {
    return Container(
      width: 65,
      height: 65,
      decoration: BoxDecoration(
        border: Border.all(color: pureWhite, width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Icon(icon, color: pureWhite, size: 30),
      ),
    );
  }

  Widget _buildLeafShape() {
    return Opacity(
      opacity: 0.9,
      child: Icon(
        Icons.eco, // Using eco as a placeholder for the leaf
        size: 200,
        color: forestGreen.withValues(alpha: 0.8),
      ),
    );
  }

  Widget _buildBlobShape() {
    return Container(
      width: 300,
      height: 400,
      decoration: BoxDecoration(
        color: forestGreen.withValues(alpha: 0.6),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(200),
          bottomRight: Radius.circular(100),
        ),
      ),
    );
  }
}

class _FeatureInfo {
  final String assetPath;
  final String title;
  final String description;

  const _FeatureInfo({
    required this.assetPath,
    required this.title,
    required this.description,
  });
}
