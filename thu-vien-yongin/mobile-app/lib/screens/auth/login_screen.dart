import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/auth_provider.dart';
import '../../theme/app_colors.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final usernameCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text('Đăng nhập')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 40),
            const Icon(Icons.menu_book, size: 80, color: Color(0xFF0F3460)),
            const SizedBox(height: 16),
            const Text('Thư viện Yongin', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            TextField(
              controller: usernameCtrl,
              decoration: const InputDecoration(labelText: 'Email / Mã thẻ', prefixIcon: Icon(Icons.email_outlined)),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Mật khẩu', prefixIcon: Icon(Icons.lock_outlined)),
            ),
            if (authState.error != null) ...[const SizedBox(height: 8), Text(authState.error!, style: const TextStyle(color: Colors.red, fontSize: 13))],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: authState.isLoading ? null : () => ref.read(authProvider.notifier).login(usernameCtrl.text, passwordCtrl.text),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F3460), foregroundColor: Colors.white),
                child: authState.isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng nhập', style: TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: () => context.go('/register'), child: const Text('Chưa có tài khoản? Đăng ký ngay')),
          ],
        ),
      ),
    );
  }
}
