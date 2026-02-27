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
    
    // Stub required state properties
    when(() => mockAuthenticatorState.formKey).thenReturn(GlobalKey<FormState>());
    when(() => mockAuthenticatorState.isBusy).thenReturn(false);
    when(() => mockAuthenticatorState.currentStep).thenReturn(AuthenticatorStep.signUp);
    
    // Stub form data fields
    when(() => mockAuthenticatorState.username).thenReturn('');
    when(() => mockAuthenticatorState.password).thenReturn('');
    when(() => mockAuthenticatorState.passwordConfirmation).thenReturn('');
    
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

  group('RegisterScreen Widget Tests (Verified)', () {
    testWidgets('Register button should react to checkboxes', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 1920);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();
      
      // 1. Find checkboxes
      final checkboxes = find.byType(Checkbox);
      expect(checkboxes, findsNWidgets(2)); // Legal + Marketing

      final registerButtonFinder = find.widgetWithText(ElevatedButton, 'Register');
      expect(tester.widget<ElevatedButton>(registerButtonFinder).enabled, isFalse);

      // 2. Check Legal (T&C + Privacy)
      await tester.tap(checkboxes.at(0));
      await tester.pump();

      expect(tester.widget<ElevatedButton>(registerButtonFinder).enabled, isTrue);
    });
  });
}
