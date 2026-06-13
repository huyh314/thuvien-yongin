import 'package:flutter/material.dart';

class EmptyWidget extends StatelessWidget {
  final String message;
  final IconData icon;
  const EmptyWidget({super.key, this.message = 'Không có dữ liệu', this.icon = Icons.inbox_outlined});

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 64, color: Colors.grey[300]),
        const SizedBox(height: 16),
        Text(message, style: const TextStyle(color: Colors.grey, fontSize: 16)),
      ]),
    ),
  );
}
