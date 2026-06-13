import 'package:flutter/material.dart';
import '../widgets/empty_widget.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Thông báo')),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _NotifCard(icon: Icons.history, color: Colors.blue, title: '⏰ Sắp đến hạn!', subtitle: 'Văn hóa Việt Nam · Hạn trả: 12/07/2026 · Còn 5 ngày', unread: true),
        _NotifCard(icon: Icons.menu_book, color: Colors.green, title: '📚 Sách mới', subtitle: 'Đã có sách mới về chủ đề Văn hóa', unread: false),
        _NotifCard(icon: Icons.check_circle, color: Colors.green, title: '✅ Đặt mượn thành công', subtitle: 'Lịch sử Việt Nam đã có sẵn tại quầy', unread: false),
      ],
    ),
  );
}

class _NotifCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final bool unread;
  const _NotifCard({required this.icon, required this.color, required this.title, required this.subtitle, this.unread = false});

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 8),
    child: ListTile(
      leading: CircleAvatar(backgroundColor: color.withOpacity(0.1), child: Icon(icon, color: color)),
      title: Row(children: [Text(title, style: TextStyle(fontWeight: unread ? FontWeight.bold : FontWeight.normal)), if (unread) ...[const SizedBox(width: 8), Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle))]]),
      subtitle: Text(subtitle),
    ),
  );
}
