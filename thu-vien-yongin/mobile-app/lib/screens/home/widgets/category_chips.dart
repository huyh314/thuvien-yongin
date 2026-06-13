import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CategoryChips extends StatelessWidget {
  const CategoryChips({super.key});

  final List<_Category> _categories = const [
    _Category('📚 Sách mới', 'newest', Color(0xFFE74C3C)),
    _Category('🔥 Bán chạy', 'popular', Color(0xFFF39C12)),
    _Category('👶 Thiếu nhi', 'thieu-nhi', Color(0xFF2ECC71)),
    _Category('🔬 Khoa học', 'khoa-hoc', Color(0xFF3498DB)),
    _Category('📖 Văn học', 'van-hoc', Color(0xFF9B59B6)),
  ];

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 44,
    child: ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _categories.length,
      separatorBuilder: (_, __) => const SizedBox(width: 8),
      itemBuilder: (_, i) => ActionChip(
        label: Text(_categories[i].name, style: const TextStyle(color: Colors.white, fontSize: 13)),
        backgroundColor: _categories[i].color,
        onPressed: () => context.go('/search?q=&cat=${_categories[i].slug}'),
      ),
    ),
  );
}

class _Category {
  final String name;
  final String slug;
  final Color color;
  const _Category(this.name, this.slug, this.color);
}
