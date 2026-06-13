import 'package:flutter/material.dart';
import '../../../models/book.dart';
import '../../../widgets/rating_stars.dart';
import '../../../widgets/cached_image.dart';

class BookCard extends StatelessWidget {
  final Book book;
  final VoidCallback? onTap;
  const BookCard({super.key, required this.book, this.onTap});

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    child: InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(children: [
          CachedBookImage(imageUrl: book.coverUrl, width: 70, height: 100),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(book.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 4),
                Text(book.authorMain, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                const SizedBox(height: 4),
                Row(children: [
                  if (book.rating > 0) ...[RatingStars(rating: book.rating, size: 14), const SizedBox(width: 8)],
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: book.isAvailable ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      book.isAvailable ? 'Còn ${book.availableCopies}' : 'Hết',
                      style: TextStyle(fontSize: 11, color: book.isAvailable ? Colors.green : Colors.red, fontWeight: FontWeight.w500),
                    ),
                  ),
                ]),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.grey),
        ]),
      ),
    ),
  );
}
