import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';

class AuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final Map<String, dynamic>? user;
  final String? error;

  const AuthState({this.isLoading = false, this.isLoggedIn = false, this.user, this.error});

  AuthState copyWith({bool? isLoading, bool? isLoggedIn, Map<String, dynamic>? user, String? error}) => AuthState(
    isLoading: isLoading ?? this.isLoading,
    isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    user: user ?? this.user,
    error: error,
  );
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _service;

  AuthNotifier(this._service) : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final loggedIn = await _service.isLoggedIn();
    if (loggedIn) {
      final profile = await _service.getProfile();
      state = AuthState(isLoggedIn: true, user: profile);
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.login(username, password);
      state = AuthState(isLoggedIn: true, user: data['user']);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Sai tên đăng nhập hoặc mật khẩu');
    }
  }

  Future<void> register(Map<String, dynamic> data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _service.register(data);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Đăng ký thất bại');
    }
  }

  Future<void> logout() async {
    await _service.logout();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier(AuthService()));
