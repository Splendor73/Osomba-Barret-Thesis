import 'package:amplify_authenticator/amplify_authenticator.dart';
import 'package:flutter/material.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key, required this.state});

  final AuthenticatorState state;

  static const Color osombaOrange = Color(0xFFEF7D00);
  static const Color forestGreen = Color(0xFF3A703F);
  static const Color pureWhite = Color(0xFFFFFFFF);

  bool get _isCodeStep =>
      state.currentStep == AuthenticatorStep.confirmResetPassword;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: osombaOrange,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: osombaOrange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: pureWhite.withValues(alpha: 0.2)),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 40,
                  ),
                  child: Theme(
                    data: Theme.of(context).copyWith(
                      inputDecorationTheme: InputDecorationTheme(
                        filled: true,
                        fillColor: pureWhite,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
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
                          const Text(
                            'Forgot password',
                            style: TextStyle(
                              color: pureWhite,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _isCodeStep
                                ? 'Enter the verification code we just sent and create your new password.'
                                : 'Enter the email associated with your account and we\'ll send you a reset code.',
                            style: TextStyle(
                              color: pureWhite.withValues(alpha: 0.9),
                              fontSize: 15,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 32),
                          if (_isCodeStep) ..._confirmFields() else ..._requestFields(),
                          const SizedBox(height: 24),
                          _actionButton(),
                          const SizedBox(height: 16),
                          TextButton(
                            onPressed: () =>
                                state.changeStep(AuthenticatorStep.signIn),
                            child: const Text(
                              'Back to sign in',
                              style: TextStyle(
                                color: pureWhite,
                                fontWeight: FontWeight.bold,
                              ),
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
        ),
      ),
    );
  }

  List<Widget> _requestFields() {
    return [
      const Text(
        'Email',
        style: TextStyle(
          color: pureWhite,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      const SizedBox(height: 8),
      SignInFormField.username(
        key: const Key('forgot_username_field'),
      ),
    ];
  }

  List<Widget> _confirmFields() {
    return const [
      Text(
        'Verification code',
        style: TextStyle(
          color: pureWhite,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      SizedBox(height: 8),
      ResetPasswordFormField.verificationCode(),
      SizedBox(height: 20),
      Text(
        'New password',
        style: TextStyle(
          color: pureWhite,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      SizedBox(height: 8),
      ResetPasswordFormField.newPassword(),
      SizedBox(height: 20),
      Text(
        'Confirm password',
        style: TextStyle(
          color: pureWhite,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      SizedBox(height: 8),
      ResetPasswordFormField.passwordConfirmation(),
    ];
  }

  Widget _actionButton() {
    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: state.isBusy
            ? null
            : () async {
                if (_isCodeStep) {
                  await state.confirmResetPassword();
                  state.changeStep(AuthenticatorStep.signIn);
                } else {
                  await state.resetPassword();
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: forestGreen,
          foregroundColor: pureWhite,
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        child: state.isBusy
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: pureWhite,
                ),
              )
            : Text(_isCodeStep ? 'Update password' : 'Send reset code'),
      ),
    );
  }
}
