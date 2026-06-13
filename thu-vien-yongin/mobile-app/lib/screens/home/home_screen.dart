import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../state/book_provider.dart';
import '../../state/auth_provider.dart';
import '../../models/book.dart';
import '../../widgets/cached_image.dart';
import '../../widgets/rating_stars.dart';
import 'widgets/search_bar.dart';
import 'widgets/category_chips.dart';
import 'widgets/newest_books.dart';
import 'widgets/news_banner.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final newestAsync = ref.watch(newestBooksProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thư viện Yongin'),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => context.go('/notifications')),
          IconButton(
            icon: Icon(authState.isLoggedIn ? Icons.person : Icons.login),
            onPressed: () => context.go(authState.isLoggedIn ? '/profile' : '/login'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(newestBooksProvider.future),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 16),
              const HomeSearchBar(),
              const SizedBox(height: 16),
              const CategoryChips(),
              const SizedBox(height: 24),
              newestAsync.when(
                data: (books) => NewestBooksSection(books: books),
                loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.all(32),
                  child: Text('Lỗi: $e', style: const TextStyle(color: Colors.grey)),
                ),
              ),
              const SizedBox(height: 16),
              const NewsBanner(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context, ref, 0),
    );
  }

  Widget _buildBottomNav(BuildContext context, WidgetRef ref, int currentIndex) {
    final authState = ref.watch(authProvider);
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (i) {
        switch (i) {
          case 0: context.go('/home');
          case 1: context.go('/search');
          case 2: context.go(authState.isLoggedIn ? '/checkouts' : '/login');
          case 3: context.go(authState.isLoggedIn ? '/profile' : '/login');
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Tìm kiếm'),
        BottomNavigationBarItem(icon: Icon(Icons.book_outlined), label: 'Của tôi'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Tài khoản'),
      ],
    );
  }
}
