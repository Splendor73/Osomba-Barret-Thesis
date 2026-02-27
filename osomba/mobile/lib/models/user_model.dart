enum UserRole { buyer, seller, both, admin }

extension UserRoleExtension on UserRole {
  String get name => toString().split('.').last;
}

class UserModel {
  final int id;
  final String email;
  final String? cognitoSub;
  final String? fullName;
  final bool isOnboarded;
  final DateTime createdAt;
  final String termsVersion;
  final DateTime acceptedTermsAt;
  final bool marketingOptIn;
  final UserRole role;

  UserModel({
    required this.id,
    required this.email,
    this.cognitoSub,
    this.fullName,
    this.isOnboarded = false,
    required this.createdAt,
    required this.termsVersion,
    required this.acceptedTermsAt,
    required this.marketingOptIn,
    this.role = UserRole.buyer,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    UserRole parseRole() {
      final raw = json['role'];
      if (raw is String) {
        final normalized = raw.toLowerCase();
        return UserRole.values.firstWhere(
          (role) => role.name.toLowerCase() == normalized,
          orElse: () => UserRole.buyer,
        );
      }
      return UserRole.buyer;
    }

    return UserModel(
      id: json['user_id'] is int ? json['user_id'] : (int.tryParse(json['user_id']?.toString() ?? '') ?? 0),
      email: json['email'] ?? '',
      cognitoSub: json['cognito_sub'],
      fullName: json['full_name'],
      isOnboarded: json['is_onboarded'] ?? false,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      termsVersion: json['terms_version'] ?? '',
      acceptedTermsAt: json['accepted_terms_at'] != null 
          ? DateTime.parse(json['accepted_terms_at']) 
          : DateTime.now(),
      marketingOptIn: json['marketing_opt_in'] ?? false,
      role: parseRole(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': id,
      'email': email,
      'cognito_sub': cognitoSub,
      'full_name': fullName,
      'is_onboarded': isOnboarded,
      'created_at': createdAt.toIso8601String(),
      'terms_version': termsVersion,
      'accepted_terms_at': acceptedTermsAt.toIso8601String(),
      'marketing_opt_in': marketingOptIn,
      'role': role.name.toUpperCase(),
    };
  }
}
