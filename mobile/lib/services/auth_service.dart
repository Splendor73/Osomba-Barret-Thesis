import 'package:dio/dio.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class AuthService {
  final Dio _dio;

  AuthService({Dio? dio}) : _dio = dio ?? ApiService.dio;

  /// Fetch the user profile from the backend.
  Future<UserModel> getProfile() async {
    try {
      final response = await _dio.get(AppConstants.meEndpoint);
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Provision a new user with T&C and marketing preferences.
  Future<UserModel> provisionUser({
    required String termsVersion,
    required bool marketingOptIn,
  }) async {
    try {
      final response = await _dio.post(
        AppConstants.meEndpoint,
        data: {
          'terms_version': termsVersion,
          'marketing_opt_in': marketingOptIn,
        },
      );
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Wrapper for Amplify Sign Up to make it testable
  Future<SignUpResult> signUp({
    required String email,
    required String password,
  }) async {
    return await Amplify.Auth.signUp(
      username: email,
      password: password,
      options: SignUpOptions(
        userAttributes: {
          AuthUserAttributeKey.email: email,
        },
      ),
    );
  }

  /// Wrapper for Amplify Resend Sign Up Code
  Future<ResendSignUpCodeResult> resendSignUpCode({
    required String email,
  }) async {
    return await Amplify.Auth.resendSignUpCode(username: email);
  }

  /// Update user onboarding data.
  Future<UserModel> onboardUser(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(
        '/auth/onboard',
        data: data,
      );
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        final detail = data['detail'];
        if (detail is String) {
          return detail;
        } else if (detail is List) {
          // Handle FastAPI validation errors which return a list of error objects
          try {
            return detail.map((err) => err['msg'] ?? err.toString()).join(', ');
          } catch (_) {
            return detail.toString();
          }
        }
        return 'An error occurred';
      }
      return data.toString();
    } else {
      return 'Network error. Please check your connection.';
    }
  }
}
