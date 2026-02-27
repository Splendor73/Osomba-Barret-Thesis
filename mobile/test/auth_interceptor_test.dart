import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:somba_mobile/services/auth_interceptor.dart';
import 'package:mocktail/mocktail.dart';

class MockHttpClientAdapter extends Mock implements HttpClientAdapter {}

void main() {
  group('AuthInterceptor Tests', () {
    late Dio dio;
    
    setUp(() {
      dio = Dio();
    });

    test('should add Authorization header when token is provided', () async {
      final interceptor = AuthInterceptor(
        tokenProvider: () async => 'test-token-123',
      );
      dio.interceptors.add(interceptor);

      // Use a simpler way to verify request options without a full mock adapter
      // by adding another interceptor that captures the final options
      RequestOptions? capturedOptions;
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          capturedOptions = options;
          return handler.resolve(Response(
            requestOptions: options,
            data: {'status': 'ok'},
            statusCode: 200,
          ));
        },
      ));

      await dio.get('https://example.com/api');
      
      expect(capturedOptions?.headers['Authorization'], 'Bearer test-token-123');
    });

    test('should NOT add Authorization header when token is null', () async {
      final interceptor = AuthInterceptor(
        tokenProvider: () async => null,
      );
      dio.interceptors.add(interceptor);

      RequestOptions? capturedOptions;
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          capturedOptions = options;
          return handler.resolve(Response(
            requestOptions: options,
            data: {'status': 'ok'},
            statusCode: 200,
          ));
        },
      ));

      await dio.get('https://example.com/api');
      
      expect(capturedOptions?.headers.containsKey('Authorization'), isFalse);
    });
  });
}
