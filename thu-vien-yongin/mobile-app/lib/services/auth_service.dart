import 'api_client.dart';
import 'storage_service.dart';

class AuthService {
  final _api = ApiClient.instance;

  Future<Map<String, dynamic>> login(String username, String password) async {
    final resp = await _api.post('/auth/login', data: {'username': username, 'password': password});
    final data = resp.data;
    await StorageService.saveToken('accessToken', data['accessToken']);
    await StorageService.saveToken('refreshToken', data['refreshToken']);
    return data;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final resp = await _api.post('/patron/register', data: data);
    return resp.data;
  }

  Future<void> logout() async {
    await StorageService.clearTokens();
  }

  Future<bool> isLoggedIn() async {
    final token = await StorageService.getToken('accessToken');
    return token != null;
  }

  Future<Map<String, dynamic>?> getProfile() async {
    final token = await StorageService.getToken('accessToken');
    if (token == null) return null;
    try {
      final resp = await _api.get('/auth/me');
      return resp.data;
    } catch (_) {
      return null;
    }
  }
}
