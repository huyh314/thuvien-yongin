import 'package:flutter/material.dart';

class AppErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  const AppErrorWidget({super.key, required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.error_outline, size: 64, color: Colors.grey),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 16)),
        if (onRetry != null) ...[const SizedBox(height: 16), ElevatedButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Thử lại'))],
      ]),
    ),
  );
}
