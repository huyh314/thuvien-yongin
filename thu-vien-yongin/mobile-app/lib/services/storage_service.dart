import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static late final SharedPreferences prefs;
  static final _secure = const FlutterSecureStorage();

  static Future<void> init() async {
    prefs = await SharedPreferences.getInstance();
  }

  // Token
  static Future<void> saveToken(String key, String value) => _secure.write(key: key, value: value);
  static Future<String?> getToken(String key) => _secure.read(key: key);
  static Future<void> clearTokens() => _secure.deleteAll();

  // Preferences
  static bool getBool(String key) => prefs.getBool(key) ?? false;
  static Future<void> setBool(String key, bool value) => prefs.setBool(key, value);
  static String getString(String key) => prefs.getString(key) ?? '';
  static Future<void> setString(String key, String value) => prefs.setString(key, value);
  static Future<void> remove(String key) => prefs.remove(key);
}
