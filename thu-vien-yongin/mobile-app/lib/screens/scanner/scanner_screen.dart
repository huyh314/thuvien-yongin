import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});
  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  MobileScannerController? _controller;

  @override
  void initState() { super.initState(); _controller = MobileScannerController(); }

  @override
  void dispose() { _controller?.dispose(); super.dispose(); }

  void _onDetect(BarcodeCapture capture) {
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;
    _controller?.stop();
    _showResult(barcode!.rawValue!);
  }

  void _showResult(String code) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, size: 64, color: Colors.green),
            const SizedBox(height: 16),
            const Text('✅ Đã quét thành công!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Mã: $code', style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            Row(children: [
              Expanded(child: OutlinedButton(onPressed: () { _controller?.start(); Navigator.pop(context); }, child: const Text('Quét tiếp'))),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))),
            ]),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Quét mã vạch'),
      actions: [
        IconButton(
          icon: const Icon(Icons.flash_on),
          onPressed: () => _controller?.toggleTorch(),
        ),
      ],
    ),
    body: MobileScanner(
      controller: _controller,
      onDetect: _onDetect,
    ),
  );
}
