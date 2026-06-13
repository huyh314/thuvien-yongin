import 'api_client.dart';
import '../models/notification.dart' as model;

class NotificationService {
  final _api = ApiClient.instance;

  Future<List<model.Notification>> getNotifications(int patronId) async {
    final resp = await _api.get('/patron/$patronId/notifications');
    return (resp.data as List?)?.map((e) => model.Notification.fromJson(e)).toList() ?? [];
  }

  Future<void> markRead(int notificationId) async {
    await _api.put('/patron/notifications/$notificationId/read');
  }

  Future<void> registerFcmToken(int patronId, String token) async {
    await _api.post('/patron/$patronId/fcm-token', data: {'token': token});
  }
}
