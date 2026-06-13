import 'package:flutter/material.dart';
import '../widgets/empty_widget.dart';
import '../models/book.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Sách yêu thích')),
    body: ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 0,
      itemBuilder: (_, i) => Card(
        child: ListTile(
          title: const Text('Văn hóa Việt Nam'),
          subtitle: const Text('Trần Quốc Vượng'),
          trailing: IconButton(icon: const Icon(Icons.favorite, color: Colors.red), onPressed: () {}),
        ),
      ),
    ),
  );
}
