import 'package:flutter/material.dart';
import '../widgets/empty_widget.dart';
import '../models/patron.dart';

class CheckoutsScreen extends StatelessWidget {
  const CheckoutsScreen({super.key});

  final List<Checkout> _checkouts = const []; // TODO: get from patronProvider

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Sách đang mượn')),
    body: _checkouts.isEmpty
      ? const EmptyWidget(message: 'Bạn chưa mượn sách nào', icon: Icons.book_outlined)
      : ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _checkouts.length,
          itemBuilder: (_, i) => Card(
            child: ListTile(
              title: Text(_checkouts[i].bookTitle ?? 'Đang tải...'),
              subtitle: Text('Hạn trả: ${_checkouts[i].dueDate}'),
              trailing: _checkouts[i].isOverdue
                ? const Icon(Icons.warning, color: Colors.red)
                : const Icon(Icons.check_circle, color: Colors.green),
            ),
          ),
        ),
  );
}
