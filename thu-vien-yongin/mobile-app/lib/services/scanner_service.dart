import 'api_client.dart';

class ScannerService {
  final _api = ApiClient.instance;

  Future<Map<String, dynamic>> scanCode(String code) async {
    final resp = await _api.get('/patron/barcode-scan/$code');
    return resp.data;
  }

  String identifyCodeType(String code) {
    if (code.startsWith('TV')) return 'patron_card';
    if (code.startsWith('M.') || code.startsWith('Đ.')) return 'book_item';
    return 'unknown';
  }

  Future<void> borrowByQr(int patronId, String code) async {
    await _api.post('/patron/$patronId/borrow-by-qr', data: {'code': code});
  }
}
