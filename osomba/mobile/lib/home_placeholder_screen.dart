import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';
// ignore: implementation_imports
import 'package:amplify_authenticator/src/state/inherited_authenticator_state.dart';

class HomePlaceholderScreen extends StatelessWidget {
  const HomePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Home screen work in progress',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                final state = InheritedAuthenticatorState.of(context);
                state.changeStep(AuthenticatorStep.signIn);
                context.go('/login');
              },
              child: const Text('Go back to login'),
            ),
          ],
        ),
      ),
    );
  }
}
