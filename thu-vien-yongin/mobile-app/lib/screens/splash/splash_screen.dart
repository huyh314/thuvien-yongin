import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) context.go('/home');
    });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.menu_book, size: 80, color: Color(0xFF0F3460)),
        const SizedBox(height: 16),
        Text('Thư viện Yongin', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF0F3460))),
        const SizedBox(height: 8),
        const Text('Thư viện số cộng đồng', style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 32),
        const CircularProgressIndicator(),
      ]),
    ),
  );
}
