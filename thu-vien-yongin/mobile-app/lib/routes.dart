import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/search/search_screen.dart';
import 'screens/book_detail/book_detail_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/checkouts_screen.dart';
import 'screens/profile/history_screen.dart';
import 'screens/profile/wishlist_screen.dart';
import 'screens/profile/notifications_screen.dart';
import 'screens/profile/digital_card_screen.dart';
import 'screens/scanner/scanner_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(path: '/works/:id', builder: (_, state) => BookDetailScreen(id: int.parse(state.pathParameters['id']!))),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/checkouts', builder: (_, __) => const CheckoutsScreen()),
      GoRoute(path: '/history', builder: (_, __) => const HistoryScreen()),
      GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/digital-card', builder: (_, __) => const DigitalCardScreen()),
      GoRoute(path: '/scanner', builder: (_, __) => const ScannerScreen()),
    ],
  );
});
