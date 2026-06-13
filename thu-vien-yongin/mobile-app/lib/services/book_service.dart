import 'api_client.dart';
import '../models/book.dart';

class BookService {
  final _api = ApiClient.instance;

  Future<List<Book>> getNewest({int limit = 12}) async {
    final resp = await _api.get('/opac/newest', query: {'limit': limit});
    return (resp.data as List).map((e) => Book.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> search(String query, {String type = 'all', int page = 1, int limit = 20}) async {
    final resp = await _api.get('/opac/search', query: {'q': query, 'type': type, 'page': page, 'limit': limit});
    final data = resp.data;
    return {
      'total': data['total'],
      'page': data['page'],
      'results': (data['results'] as List).map((e) => Book.fromJson(e)).toList(),
      'suggestions': (data['suggestions'] as List?)?.map((e) => e.toString()).toList() ?? [],
    };
  }

  Future<List<String>> getSuggestions(String query) async {
    final resp = await _api.get('/opac/suggest', query: {'q': query});
    return (resp.data['suggestions'] as List?)?.map((e) => e['text'].toString()).toList() ?? [];
  }

  Future<Book> getDetail(int id) async {
    final resp = await _api.get('/opac/works/$id');
    return Book.fromJson(resp.data);
  }

  Future<Map<String, dynamic>> getFeatured() async {
    final resp = await _api.get('/opac/featured');
    return resp.data;
  }
}
