import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../theme/app_colors.dart';

class DigitalCardScreen extends StatelessWidget {
  const DigitalCardScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Thẻ thư viện số')),
    body: Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.menu_book, size: 48, color: Color(0xFF0F3460)),
                const SizedBox(height: 8),
                const Text('THƯ VIỆN YONGIN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F3460))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[200]!)),
                  child: QrImageView(
                    data: 'TV000001',
                    version: QrVersions.auto,
                    size: 180,
                    eyeStyle: const QrEyeStyle(color: Color(0xFF0F3460)),
                    dataModuleStyle: const QrDataModuleStyle(color: Color(0xFF0F3460)),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('NGUYỄN VĂN AN', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('TV000123', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 4),
                const Text('Người lớn', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                Row(children: [
                  Expanded(child: OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.share), label: const Text('Chia sẻ'))),
                  const SizedBox(width: 12),
                  Expanded(child: ElevatedButton.icon(onPressed: () {}, icon: const Icon(Icons.download), label: const Text('Tải xuống'), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F3460), foregroundColor: Colors.white))),
                ]),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
