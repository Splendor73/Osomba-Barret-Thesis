import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:dio/dio.dart';

typedef TokenProvider = Future<String?> Function();

/// Interceptor that automatically attaches the Cognito ID Token to every outgoing request.
class AuthInterceptor extends Interceptor {
  final TokenProvider _tokenProvider;

  AuthInterceptor({TokenProvider? tokenProvider})
      : _tokenProvider = tokenProvider ?? _defaultTokenProvider;

  static Future<String?> _defaultTokenProvider() async {
    try {
      final session = await Amplify.Auth.fetchAuthSession() as CognitoAuthSession;
      return session.userPoolTokensResult.value.idToken.raw;
    } catch (e) {
      safePrint('AuthInterceptor: Failed to fetch session: $e');
      return null;
    }
  }

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenProvider();
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    return handler.next(options);
  }
}
