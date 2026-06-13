import 'package:flutter/material.dart';
import '../widgets/empty_widget.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Lịch sử mượn/trả')),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.check_circle, color: Colors.green),
            title: const Text('Văn hóa Việt Nam'),
            subtitle: const Text('Trả: 20/06/2026 · Đúng hạn'),
            trailing: const Text('✅'),
          ),
        ),
        Card(
          child: ListTile(
            leading: const Icon(Icons.warning, color: Colors.orange),
            title: const Text('Tìm hiểu RFID'),
            subtitle: const Text('Trả: 15/06/2026 · Quá hạn 5 ngày'),
            trailing: const Text('⚠️'),
          ),
        ),
      ],
    ),
  );
}
