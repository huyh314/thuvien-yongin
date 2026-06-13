import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/notification_service.dart' as service;
import '../models/notification.dart' as model;

class NotificationState {
  final List<model.Notification> items;
  final int unreadCount;
  final bool isLoading;

  const NotificationState({this.items = const [], this.unreadCount = 0, this.isLoading = false});
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final service.NotificationService _service;

  NotificationNotifier(this._service) : super(const NotificationState());

  Future<void> load(int patronId) async {
    state = NotificationState(isLoading: true);
    try {
      final items = await _service.getNotifications(patronId);
      final unread = items.where((n) => !n.isRead).length;
      state = NotificationState(items: items, unreadCount: unread);
    } catch (_) {
      state = const NotificationState();
    }
  }

  Future<void> markRead(int id) async {
    await _service.markRead(id);
    state = NotificationState(
      items: state.items.map((n) => n.id == id ? model.Notification(id: n.id, patronId: n.patronId, title: n.title, body: n.body, type: n.type, isRead: true, sentAt: n.sentAt) : n).toList(),
      unreadCount: state.unreadCount - 1,
    );
  }
}

final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) => NotificationNotifier(service.NotificationService()));
