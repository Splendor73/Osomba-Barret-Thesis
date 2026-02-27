import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:somba_mobile/providers/user_provider.dart';
import 'package:somba_mobile/services/auth_service.dart';
import 'package:somba_mobile/models/user_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MockAuthService extends Mock implements AuthService {}
class MockSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late UserProvider userProvider;
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
    userProvider = UserProvider(authService: mockAuthService);
  });

  group('UserProvider JIT Logic Tests (Refactored)', () {
    test('provisionNewUser should call authService.provisionUser and update state', () async {
      final mockUser = UserModel(
        id: 1,
        email: 'test@example.com',
        createdAt: DateTime.now(),
        termsVersion: 'v1',
        acceptedTermsAt: DateTime.now(),
        marketingOptIn: true,
      );

      when(() => mockAuthService.provisionUser(
        termsVersion: any(named: 'termsVersion'),
        marketingOptIn: any(named: 'marketingOptIn'),
      )).thenAnswer((_) async => mockUser);

      await userProvider.provisionNewUser(
        termsVersion: 'v1',
        marketingOptIn: true,
      );

      expect(userProvider.user, isNotNull);
      expect(userProvider.user!.email, 'test@example.com');
      verify(() => mockAuthService.provisionUser(
        termsVersion: 'v1',
        marketingOptIn: true,
      )).called(1);
    });
  });
}
