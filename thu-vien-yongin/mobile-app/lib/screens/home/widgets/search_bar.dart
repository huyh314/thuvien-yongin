import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({super.key});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: InkWell(
      onTap: () => context.go('/search'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
        ),
        child: Row(children: [
          const Icon(Icons.search, color: Colors.grey),
          const SizedBox(width: 12),
          Text('🔍 Tìm kiếm sách...', style: TextStyle(color: Colors.grey[400], fontSize: 16)),
        ]),
      ),
    ),
  );
}
