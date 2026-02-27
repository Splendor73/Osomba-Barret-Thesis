import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:provider/provider.dart';
import 'package:somba_mobile/screens/auth/register_screen.dart';
import 'package:somba_mobile/providers/user_provider.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';
// ignore: implementation_imports
import 'package:amplify_authenticator/src/state/inherited_authenticator_state.dart';
// ignore: implementation_imports
import 'package:amplify_authenticator/src/state/inherited_strings.dart';
// ignore: implementation_imports
import 'package:amplify_authenticator/src/state/inherited_config.dart';

class MockUserProvider extends Mock implements UserProvider {}
class MockAuthenticatorState extends Mock implements AuthenticatorState {}

void main() {
  late MockUserProvider mockUserProvider;
  late MockAuthenticatorState mockAuthenticatorState;

  setUp(() {
    mockUserProvider = MockUserProvider();
    mockAuthenticatorState = MockAuthenticatorState();
    
    when(() => mockUserProvider.isInitialized).thenReturn(true);
    when(() => mockUserProvider.saveRegistrationChoices(
      termsVersion: any(named: 'termsVersion'),
      marketingOptIn: any(named: 'marketingOptIn'),
    )).thenAnswer((_) async {});

    // Stub required state properties
    when(() => mockAuthenticatorState.formKey).thenReturn(GlobalKey<FormState>());
    when(() => mockAuthenticatorState.isBusy).thenReturn(false);
    when(() => mockAuthenticatorState.currentStep).thenReturn(AuthenticatorStep.signUp);
    when(() => mockAuthenticatorState.username).thenReturn('');
    when(() => mockAuthenticatorState.password).thenReturn('');
    when(() => mockAuthenticatorState.passwordConfirmation).thenReturn('');
    
    // Mock the signUp method
    when(() => mockAuthenticatorState.signUp()).thenAnswer((_) async {});
    
    // Stub listeners
    when(() => mockAuthenticatorState.addListener(any())).thenReturn(null);
    when(() => mockAuthenticatorState.removeListener(any())).thenReturn(null);
  });

  Widget createWidgetUnderTest() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<UserProvider>.value(value: mockUserProvider),
      ],
      child: MaterialApp(
        home: InheritedConfig(
          amplifyOutputs: null,
          padding: EdgeInsets.zero,
          child: InheritedStrings(
            resolver: const AuthStringResolver(),
            child: InheritedAuthenticatorState(
              state: mockAuthenticatorState,
              child: RegisterScreen(state: mockAuthenticatorState),
            ),
          ),
        ),
      ),
    );
  }

  group('E2E Registration Flow (Simulation)', () {
    testWidgets('should call signUp on AuthenticatorState and save choices', (WidgetTester tester) async {
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // 1. Accept Terms
      final tcCheckbox = find.byType(Checkbox).at(0);
      await tester.ensureVisible(tcCheckbox);
      await tester.tap(tcCheckbox);

      final privacyCheckbox = find.byType(Checkbox).at(1);
      await tester.ensureVisible(privacyCheckbox);
      await tester.tap(privacyCheckbox);
      
      await tester.pump();

      // 2. Click Register
      final registerButton = find.text('Register');
      await tester.tap(registerButton);
      await tester.pump();

      // VERIFY: AuthenticatorState.signUp was called
      verify(() => mockAuthenticatorState.signUp()).called(1);
      
      // VERIFY: choices were saved to UserProvider
      verify(() => mockUserProvider.saveRegistrationChoices(
        termsVersion: '2026-q1-v1',
        marketingOptIn: any(named: 'marketingOptIn'),
      )).called(1);
    });
  });
}
