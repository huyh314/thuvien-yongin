import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final darkModeProvider = StateNotifierProvider<DarkModeNotifier, bool>((ref) => DarkModeNotifier());

class DarkModeNotifier extends StateNotifier<bool> {
  DarkModeNotifier() : super(false) { _load(); }
  void _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getBool('darkMode') ?? false;
  }
  void toggle() async {
    state = !state;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('darkMode', state);
  }
}
