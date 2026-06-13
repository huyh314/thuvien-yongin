import 'package:flutter/material.dart';

class NewsBanner extends StatelessWidget {
  const NewsBanner({super.key});

  final List<Map<String, String>> _news = const [
    {'date': '02/05', 'title': 'Ngày hội Sách Đà Nẵng 2026'},
    {'date': '16/05', 'title': 'Hội thi Kể chuyện theo sách lần 1'},
    {'date': '19/05', 'title': 'Kỷ niệm 136 năm ngày sinh Bác Hồ'},
    {'date': '30/05', 'title': 'Ngày hội Sách tại xã Trà My'},
  ];

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: 8),
          child: Text('📰 Tin tức & Sự kiện', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        ..._news.map((n) => ListTile(
          dense: true,
          leading: const Icon(Icons.calendar_today, size: 18, color: Color(0xFF0F3460)),
          title: Text(n['title']!, style: const TextStyle(fontSize: 14)),
          subtitle: Text(n['date']!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        )),
      ],
    ),
  );
}
