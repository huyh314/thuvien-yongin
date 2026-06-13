class Notification {
  final int id;
  final int? patronId;
  final String title;
  final String body;
  final String? type;
  final bool isRead;
  final String sentAt;

  Notification({
    required this.id,
    this.patronId,
    required this.title,
    required this.body,
    this.type,
    this.isRead = false,
    required this.sentAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) => Notification(
    id: json['id'] ?? 0,
    patronId: json['patron_id'],
    title: json['title'] ?? '',
    body: json['body'] ?? '',
    type: json['type'],
    isRead: json['is_read'] ?? false,
    sentAt: json['sent_at'] ?? json['created_at'] ?? '',
  );

  String get timeAgo {
    final dt = DateTime.tryParse(sentAt);
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 7) return '${diff.inDays ~/ 7} tuần trước';
    if (diff.inDays > 0) return '${diff.inDays} ngày trước';
    if (diff.inHours > 0) return '${diff.inHours} giờ trước';
    return 'Vừa xong';
  }
}
