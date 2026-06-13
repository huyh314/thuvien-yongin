import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../models/book.dart';
import '../../../widgets/cached_image.dart';
import '../../../widgets/rating_stars.dart';

class NewestBooksSection extends StatelessWidget {
  final List<Book> books;
  const NewestBooksSection({super.key, required this.books});

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('⭐ Sách mới nhất', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          TextButton(onPressed: () => context.go('/search?q='), child: const Text('Xem tất cả →')),
        ]),
      ),
      const SizedBox(height: 8),
      SizedBox(
        height: 230,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: books.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, i) => _NewestBookCard(book: books[i]),
        ),
      ),
    ],
  );
}

class _NewestBookCard extends StatelessWidget {
  final Book book;
  const _NewestBookCard({required this.book});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () => context.go('/works/${book.id}'),
    child: SizedBox(
      width: 140,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CachedBookImage(imageUrl: book.coverUrl, width: 140, height: 180),
          const SizedBox(height: 8),
          Text(book.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
          const SizedBox(height: 2),
          Text(book.authorMain, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.grey, fontSize: 11)),
          if (book.rating > 0) ...[const SizedBox(height: 2), RatingStars(rating: book.rating, size: 12)],
        ],
      ),
    ),
  );
}
