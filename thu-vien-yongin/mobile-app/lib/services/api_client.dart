import 'package:dio/dio.dart';
import 'storage_service.dart';

class ApiClient {
  static const String _baseUrl = 'http://localhost:3000/api';
  late final Dio dio;

  ApiClient._() {
    dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService.getToken('accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refresh = await StorageService.getToken('refreshToken');
          if (refresh != null) {
            try {
              final resp = await Dio(BaseOptions(baseUrl: _baseUrl)).post('/auth/refresh', data: {'refreshToken': refresh});
              if (resp.statusCode == 200) {
                await StorageService.saveToken('accessToken', resp.data['accessToken']);
                error.requestOptions.headers['Authorization'] = 'Bearer ${resp.data['accessToken']}';
                final retry = await dio.fetch(error.requestOptions);
                return handler.resolve(retry);
              }
            } catch (_) {}
          }
          await StorageService.clearTokens();
        }
        handler.next(error);
      },
    ));
  }

  static final ApiClient instance = ApiClient._();

  Future<Response> get(String path, {Map<String, dynamic>? query}) => dio.get(path, queryParameters: query);
  Future<Response> post(String path, {dynamic data}) => dio.post(path, data: data);
  Future<Response> put(String path, {dynamic data}) => dio.put(path, data: data);
  Future<Response> delete(String path) => dio.delete(path);
}
