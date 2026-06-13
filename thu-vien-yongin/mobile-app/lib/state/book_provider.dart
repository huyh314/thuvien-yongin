import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/book_service.dart';
import '../models/book.dart';

final newestBooksProvider = FutureProvider<List<Book>>((ref) async {
  return BookService().getNewest();
});

final bookDetailProvider = FutureProvider.family<Book, int>((ref, id) async {
  return BookService().getDetail(id);
});

final featuredProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return BookService().getFeatured();
});
