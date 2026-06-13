import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/auth_provider.dart';
import '../../models/patron.dart';
import '../../widgets/loading_widget.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    if (!authState.isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: const Text('Tài khoản')),
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.person_outline, size: 80, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Vui lòng đăng nhập', style: TextStyle(fontSize: 16, color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () => context.go('/login'), child: const Text('Đăng nhập')),
          ]),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(children: [
                CircleAvatar(radius: 32, child: Text(authState.user!['fullName']?.toString().substring(0, 1) ?? '?', style: const TextStyle(fontSize: 24))),
                const SizedBox(width: 16),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(authState.user!['fullName']?.toString() ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(authState.user!['roleName']?.toString() ?? '', style: const TextStyle(color: Colors.grey)),
                ]),
              ]),
            ),
          ),
          const SizedBox(height: 16),
          _MenuItem(icon: Icons.credit_card, title: 'Thẻ thư viện số', onTap: () => context.go('/digital-card')),
          _MenuItem(icon: Icons.book_outlined, title: 'Sách đang mượn', onTap: () => context.go('/checkouts')),
          _MenuItem(icon: Icons.history, title: 'Lịch sử mượn/trả', onTap: () => context.go('/history')),
          _MenuItem(icon: Icons.favorite_outline, title: 'Sách yêu thích', onTap: () => context.go('/wishlist')),
          _MenuItem(icon: Icons.notifications_outlined, title: 'Thông báo', onTap: () => context.go('/notifications')),
          _MenuItem(icon: Icons.qr_code_scanner, title: 'Quét mã', onTap: () => context.go('/scanner')),
          const SizedBox(height: 16),
          _MenuItem(icon: Icons.logout, title: 'Đăng xuất', color: Colors.red, onTap: () { ref.read(authProvider.notifier).logout(); context.go('/home'); }),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color? color;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 4),
    child: ListTile(
      leading: Icon(icon, color: color),
      title: Text(title, style: color != null ? TextStyle(color: color) : null),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    ),
  );
}
