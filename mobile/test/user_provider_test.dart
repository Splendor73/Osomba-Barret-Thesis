import 'package:flutter_test/flutter_test.dart';
import 'package:somba_mobile/providers/user_provider.dart';

void main() {
  group('UserProvider Tests', () {
    late UserProvider userProvider;

    setUp(() {
      userProvider = UserProvider();
    });

    test('initial state should be unauthenticated and not loading', () {
      expect(userProvider.user, isNull);
      expect(userProvider.isAuthenticated, isFalse);
      expect(userProvider.isLoading, isFalse);
      expect(userProvider.isInitialized, isFalse);
    });
  });
}
