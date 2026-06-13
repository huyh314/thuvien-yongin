import 'api_client.dart';
import '../models/patron.dart';

class PatronService {
  final _api = ApiClient.instance;

  Future<Patron> getProfile(int id) async {
    final resp = await _api.get('/patron/$id');
    return Patron.fromJson(resp.data);
  }

  Future<List<Checkout>> getCheckouts(int patronId) async {
    final resp = await _api.get('/patron/$patronId/checkouts');
    return (resp.data as List?)?.map((e) => Checkout.fromJson(e)).toList() ?? [];
  }

  Future<Map<String, dynamic>> getHistory(int patronId, {int page = 1}) async {
    final resp = await _api.get('/patron/$patronId/history', query: {'page': page});
    return resp.data;
  }

  Future<List<Book>> getWishlist(int patronId) async {
    final resp = await _api.get('/patron/$patronId/wishlist');
    return (resp.data as List?)?.map((e) => Book.fromJson(e)).toList() ?? [];
  }

  Future<void> toggleWishlist(int patronId, int bibId) async {
    await _api.post('/patron/$patronId/wishlist', data: {'bibId': bibId});
  }

  Future<void> removeWishlist(int patronId, int bibId) async {
    await _api.delete('/patron/$patronId/wishlist/$bibId');
  }

  Future<Map<String, dynamic>> renewBook(int circulationId) async {
    final resp = await _api.post('/circulation/$circulationId/renew');
    return resp.data;
  }
}
