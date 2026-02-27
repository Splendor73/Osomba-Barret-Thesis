/*
 * File: services/api_service.dart
 * Purpose: Configures the Dio HTTP client with base URL and interceptors.
 * Usage: Access ApiService.dio to make authenticated network requests.
 * Architecture: Service Layer - Low-level networking infrastructure.
 */
import 'package:dio/dio.dart';
import '../utils/constants.dart';
import 'auth_interceptor.dart';

class ApiService {
  static final Dio _dio = Dio();

  static void init() {
    _dio.options.baseUrl = AppConstants.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 5);
    _dio.options.receiveTimeout = const Duration(seconds: 3);
    
    // Add interceptors
    _dio.interceptors.addAll([
      AuthInterceptor(),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ),
    ]);
  }

  static Dio get dio => _dio;
}
