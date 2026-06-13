import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/book_service.dart';
import '../models/book.dart';

class SearchState {
  final String query;
  final bool isLoading;
  final List<Book> results;
  final List<String> suggestions;
  final int total;
  final int page;
  final String? error;

  const SearchState({this.query = '', this.isLoading = false, this.results = const [], this.suggestions = const [], this.total = 0, this.page = 1, this.error});
}

class SearchNotifier extends StateNotifier<SearchState> {
  final BookService _service;

  SearchNotifier(this._service) : super(const SearchState());

  void setQuery(String q) => state = state.copyWith(query: q);

  Future<void> search({String type = 'all'}) async {
    if (state.query.isEmpty) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final data = await _service.search(state.query, type: type);
      state = SearchState(
        query: state.query,
        results: data['results'] as List<Book>,
        total: data['total'] as int,
        suggestions: (data['suggestions'] as List?)?.cast<String>() ?? [],
        page: 1,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Lỗi tìm kiếm');
    }
  }

  Future<void> loadMore() async {
    if (state.isLoading) return;
    state = state.copyWith(isLoading: true);
    final nextPage = state.page + 1;
    try {
      final data = await _service.search(state.query, page: nextPage);
      final newResults = [...state.results, ...(data['results'] as List<Book>)];
      state = state.copyWith(results: newResults, page: nextPage, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  void clear() => state = const SearchState();
}

extension SearchStateExt on SearchState {
  SearchState copyWith({String? query, bool? isLoading, List<Book>? results, List<String>? suggestions, int? total, int? page, String? error}) => SearchState(
    query: query ?? this.query,
    isLoading: isLoading ?? this.isLoading,
    results: results ?? this.results,
    suggestions: suggestions ?? this.suggestions,
    total: total ?? this.total,
    page: page ?? this.page,
    error: error,
  );
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) => SearchNotifier(BookService()));
