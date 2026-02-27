import 'package:flutter_test/flutter_test.dart';
import 'package:somba_mobile/models/user_model.dart';

void main() {
  group('UserModel Tests', () {
    test('should parse JSON correctly with T&C fields', () {
      final json = {
        'user_id': 1,
        'email': 'test@example.com',
        'cognito_sub': 'uuid-123',
        'is_onboarded': true,
        'created_at': '2026-02-11T21:00:00Z',
        'terms_version': '2026-q1-v1',
        'accepted_terms_at': '2026-02-13T10:00:00Z',
        'marketing_opt_in': true,
        'role': 'SELLER',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 1);
      expect(user.email, 'test@example.com');
      expect(user.termsVersion, '2026-q1-v1');
      expect(user.marketingOptIn, true);
      expect(user.role, UserRole.seller);
      expect(user.acceptedTermsAt, isA<DateTime>());
      expect(user.acceptedTermsAt.year, 2026);
    });

    test('should handle missing T&C fields with defaults', () {
      final json = {
        'user_id': 2,
        'email': 'minimal@example.com',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 2);
      expect(user.email, 'minimal@example.com');
      expect(user.termsVersion, '');
      expect(user.marketingOptIn, false);
      expect(user.role, UserRole.buyer);
      expect(user.acceptedTermsAt, isA<DateTime>());
    });

    test('should serialize to JSON correctly', () {
      final user = UserModel(
        id: 3,
        email: 'save@example.com',
        createdAt: DateTime.now(),
        termsVersion: 'v2',
        acceptedTermsAt: DateTime.now(),
        marketingOptIn: false,
        role: UserRole.both,
      );

      final json = user.toJson();

      expect(json['user_id'], 3);
      expect(json['terms_version'], 'v2');
      expect(json['marketing_opt_in'], false);
      expect(json['role'], 'BOTH');
    });
  });
}
