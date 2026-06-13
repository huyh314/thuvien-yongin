import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/book_provider.dart';
import '../../widgets/cached_image.dart';
import '../../widgets/rating_stars.dart';
import '../../widgets/error_widget.dart';

class BookDetailScreen extends ConsumerWidget {
  final int id;
  const BookDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookAsync = ref.watch(bookDetailProvider(id));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết sách'),
        actions: [IconButton(icon: const Icon(Icons.favorite_border), onPressed: () {})],
      ),
      body: bookAsync.when(
        data: (book) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Hero(
                  tag: 'book-${book.id}',
                  child: CachedBookImage(imageUrl: book.coverUrl, width: 160, height: 240),
                ),
              ),
              const SizedBox(height: 16),
              Text(book.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(book.authorMain, style: TextStyle(fontSize: 16, color: Colors.grey[600])),
              const SizedBox(height: 8),
              Row(children: [
                if (book.rating > 0) ...[RatingStars(rating: book.rating, size: 20), const SizedBox(width: 8)],
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: book.isAvailable ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    book.isAvailable ? '✅ Còn ${book.availableCopies} bản' : '❌ Hết bản',
                    style: TextStyle(color: book.isAvailable ? Colors.green : Colors.red, fontWeight: FontWeight.w600),
                  ),
                ),
              ]),
              const Divider(height: 32),
              _InfoTile('📄 NXB', book.publisherName ?? ''),
              _InfoTile('🆔 ISBN', book.isbn ?? ''),
              _InfoTile('📏 Kích thước', book.sizeCm ?? ''),
              _InfoTile('🌐 Ngôn ngữ', book.languageCode?.toUpperCase() ?? ''),
              if (book.summary != null && book.summary!.isNotEmpty) ...[
                const Divider(height: 32),
                const Text('📝 Tóm tắt', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(book.summary!, style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.5)),
              ],
              if (book.subjects.isNotEmpty) ...[
                const Divider(height: 32),
                const Text('🏷️ Từ khóa', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 4,
                  children: book.subjects.map((s) => Chip(label: Text(s, style: const TextStyle(fontSize: 12)), materialTapTargetSize: MaterialTapTargetSize.shrinkWrap)).toList(),
                ),
              ],
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: book.isAvailable ? () {} : null,
                  icon: const Icon(Icons.auto_stories),
                  label: const Text('Đặt mượn'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    backgroundColor: const Color(0xFF0F3460),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AppErrorWidget(message: 'Không thể tải thông tin sách', onRetry: () => ref.invalidate(bookDetailProvider(id))),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label;
  final String value;
  const _InfoTile(this.label, this.value);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(children: [
      Text('$label: ', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
      Text(value, style: const TextStyle(fontSize: 14)),
    ]),
  );
}
