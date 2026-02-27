import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';
import '../../providers/user_provider.dart';
import 'widgets/terms_conditions_dialog.dart';

class RegisterScreen extends StatefulWidget {
  final AuthenticatorState state;
  const RegisterScreen({super.key, required this.state});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  static const Color osombaOrange = Color(0xFFEF7D00);
  static const Color forestGreen = Color(0xFF3A703F);
  static const Color actionGreen = Color(0xFF2A9D15);
  static const Color pureWhite = Color(0xFFFFFFFF);

  bool _acceptedLegal = false;
  bool _marketingOptIn = false;

  Future<void> _showTC() async {
    showDialog(
      context: context,
      builder: (context) => const TermsConditionsDialog(
        title: 'Terms & Conditions',
        content: 'This is placeholder content for Osomba Terms & Conditions. '
            'In a real app, this would contain legal text about user responsibilities, '
            'prohibited items, fees, and dispute resolution.',
      ),
    );
  }

  Future<void> _showPrivacy() async {
    showDialog(
      context: context,
      builder: (context) => const TermsConditionsDialog(
        title: 'Privacy Policy',
        content: 'This is placeholder content for Osomba Privacy Policy. '
            'We value your privacy. We collect data to provide marketplace services, '
            'facilitate transactions, and improve your experience.',
      ),
    );
  }

  Future<void> _handleRegister() async {
    // 1. Validate the mandatory checkboxes
    if (!_acceptedLegal) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please accept the Privacy Policy and Terms & Conditions')),
      );
      return;
    }

    // 2. Save JIT choices locally before submitting
    final userProvider = context.read<UserProvider>();
    await userProvider.saveRegistrationChoices(
      termsVersion: '2026-q1-v1',
      marketingOptIn: _marketingOptIn,
    );

    // 3. Trigger the Authenticator machine's signup
    // This will perform validation on the standard fields and handle transitions.
    await widget.state.signUp();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: osombaOrange,
      body: Stack(
        children: [
          _buildTopWave(),
          _buildBottomWave(),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Theme(
                    data: Theme.of(context).copyWith(
                      inputDecorationTheme: InputDecorationTheme(
                        filled: true,
                        fillColor: pureWhite,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 14,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(
                            color: forestGreen,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    child: AuthenticatorForm(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: 20),
                          _buildLogoMark(),
                          const SizedBox(height: 20),
                          const Text(
                            'Create account',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: pureWhite,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 40),
                          _buildLabel('Email/Phone number'),
                          SignUpFormField.email(required: true),
                          const SizedBox(height: 20),
                          _buildLabel('Password'),
                          SignUpFormField.password(),
                          const SizedBox(height: 20),
                          _buildLabel('Repeat password'),
                          SignUpFormField.passwordConfirmation(),
                          const SizedBox(height: 30),
                          _buildAgreements(context),
                          const SizedBox(height: 30),
                          SizedBox(
                            height: 60,
                            child: ElevatedButton(
                              onPressed: (_acceptedLegal && !widget.state.isBusy)
                                  ? _handleRegister
                                  : null,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: actionGreen,
                                foregroundColor: pureWhite,
                                textStyle: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              child: widget.state.isBusy
                                  ? const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: pureWhite,
                                      ),
                                    )
                                  : const Text('Register'),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextButton(
                            onPressed: () => widget.state.changeStep(AuthenticatorStep.signIn),
                            child: const Text(
                              'Already have an account? Sign In',
                              style: TextStyle(color: pureWhite),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAgreements(BuildContext context) {
    Widget buildCheckbox({
      required bool value,
      required ValueChanged<bool?> onChanged,
      required Widget title,
    }) {
      return CheckboxListTile(
        value: value,
        onChanged: onChanged,
        title: title,
        activeColor: actionGreen,
        checkColor: pureWhite,
        side: const BorderSide(color: pureWhite),
        controlAffinity: ListTileControlAffinity.leading,
        contentPadding: EdgeInsets.zero,
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      decoration: BoxDecoration(
        color: pureWhite.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: pureWhite.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          buildCheckbox(
            value: _acceptedLegal,
            onChanged: (val) => setState(() => _acceptedLegal = val ?? false),
            title: Wrap(
              children: [
                const Text('I acknowledge the ', style: TextStyle(color: pureWhite)),
                GestureDetector(
                  onTap: _showPrivacy,
                  child: const Text(
                    'Privacy Policy',
                    style: TextStyle(
                      color: pureWhite,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
                const Text(' and agree to the ', style: TextStyle(color: pureWhite)),
                GestureDetector(
                  onTap: _showTC,
                  child: const Text(
                    'Terms & Conditions',
                    style: TextStyle(
                      color: pureWhite,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          CheckboxListTile(
            value: _marketingOptIn,
            onChanged: (val) => setState(() => _marketingOptIn = val ?? false),
            title: const Text(
              'Send me updates about Osomba deals',
              style: TextStyle(color: pureWhite),
            ),
            activeColor: actionGreen,
            checkColor: pureWhite,
            side: const BorderSide(color: pureWhite),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
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

  Widget _buildLogoMark() {
    return Image.asset(
      'assets/images/logo_mark_white_orange.png',
      height: 80,
    );
  }

  Widget _buildTopWave() {
    return Positioned(
      top: -180,
      right: -80,
      child: Container(
        width: 320,
        height: 280,
        decoration: BoxDecoration(
          color: forestGreen,
          borderRadius: BorderRadius.circular(200),
        ),
      ),
    );
  }

  Widget _buildBottomWave() {
    return Positioned(
      bottom: -140,
      left: -120,
      child: Container(
        width: 420,
        height: 360,
        decoration: BoxDecoration(
          color: forestGreen.withValues(alpha: 0.85),
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(260),
            topLeft: Radius.circular(200),
          ),
        ),
      ),
    );
  }
}
