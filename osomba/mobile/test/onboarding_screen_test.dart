import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:somba_mobile/screens/auth/onboarding_screen.dart';
import 'package:somba_mobile/providers/user_provider.dart';
import 'package:mocktail/mocktail.dart';

class MockUserProvider extends Mock implements UserProvider {}

void main() {
  late MockUserProvider mockUserProvider;

  setUp(() {
    mockUserProvider = MockUserProvider();
  });

  Widget createOnboardingScreen() {
    return MaterialApp(
      home: ChangeNotifierProvider<UserProvider>.value(
        value: mockUserProvider,
        child: const OnboardingScreen(),
      ),
    );
  }

  testWidgets('OnboardingScreen should update selected role when RadioListTile is tapped', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createOnboardingScreen());

    expect(find.text('Buyer'), findsOneWidget);
    expect(find.text('Seller'), findsOneWidget);
    expect(find.text('Both'), findsOneWidget);

    // Ensure 'Seller' is visible before tapping
    await tester.ensureVisible(find.text('Seller'));
    await tester.tap(find.text('Seller'));
    await tester.pump();
  });

  testWidgets('OnboardingScreen should call onboardUser with correct data on submit', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createOnboardingScreen());

    // Fill the form - ensure visible before entering text
    final fullNameField = find.byType(TextFormField).at(0);
    await tester.ensureVisible(fullNameField);
    await tester.enterText(fullNameField, 'John Doe');

    final userNameField = find.byType(TextFormField).at(1);
    await tester.ensureVisible(userNameField);
    await tester.enterText(userNameField, 'johndoe');

    final phoneField = find.byType(TextFormField).at(2);
    await tester.ensureVisible(phoneField);
    // Leave phone empty (optional)

    final addressField = find.byType(TextFormField).at(3);
    await tester.ensureVisible(addressField);
    await tester.enterText(addressField, '123 Main St');

    final cityField = find.byType(TextFormField).at(4);
    await tester.ensureVisible(cityField);
    await tester.enterText(cityField, 'Phoenix');

    final countryField = find.byType(TextFormField).at(5);
    await tester.ensureVisible(countryField);
    await tester.enterText(countryField, 'Kenya');
    
    // Select 'Both' role
    final bothRole = find.text('Both');
    await tester.ensureVisible(bothRole);
    await tester.tap(bothRole);
    await tester.pump();

    // Mock successful onboarding
    when(() => mockUserProvider.onboardUser(any())).thenAnswer((_) async => {});

    // Submit
    final submitButton = find.text('Complete Onboarding');
    await tester.ensureVisible(submitButton);
    await tester.tap(submitButton);
    await tester.pump();

    // Verify onboardUser was called with 'BOTH' role and null phone
    final captured = verify(() => mockUserProvider.onboardUser(captureAny())).captured.single as Map<String, dynamic>;
    expect(captured['role'], 'BOTH');
    expect(captured['full_name'], 'John Doe');
    expect(captured['phone_number'], null);
    expect(captured['country'], 'Kenya');
  });

  testWidgets('OnboardingScreen should show error messages for invalid inputs', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 1920);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createOnboardingScreen());

    // Enter invalid username (with spaces)
    final userNameField = find.byType(TextFormField).at(1);
    await tester.ensureVisible(userNameField);
    await tester.enterText(userNameField, 'invalid user');

    // Enter invalid phone
    final phoneField = find.byType(TextFormField).at(2);
    await tester.ensureVisible(phoneField);
    await tester.enterText(phoneField, 'abc');

    // Enter non-African country
    final countryField = find.byType(TextFormField).at(5);
    await tester.ensureVisible(countryField);
    await tester.enterText(countryField, 'United States');

    // Submit
    final submitButton = find.text('Complete Onboarding');
    await tester.ensureVisible(submitButton);
    await tester.tap(submitButton);
    await tester.pump();

    // Verify error messages
    expect(find.text('Username cannot contain spaces'), findsOneWidget);
    expect(find.text('Please enter a valid phone number'), findsOneWidget);
    expect(find.text('Invalid country'), findsOneWidget);
    
    // Verify onboardUser was NOT called
    verifyNever(() => mockUserProvider.onboardUser(any()));
  });
}
