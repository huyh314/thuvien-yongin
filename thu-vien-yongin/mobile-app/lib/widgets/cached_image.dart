import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class CachedBookImage extends StatelessWidget {
  final String? imageUrl;
  final double width;
  final double height;
  const CachedBookImage({super.key, this.imageUrl, this.width = 120, this.height = 180});

  @override
  Widget build(BuildContext context) {
    if (imageUrl == null || imageUrl!.isEmpty) return _placeholder;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: CachedNetworkImage(
        imageUrl: imageUrl!,
        width: width,
        height: height,
        fit: BoxFit.cover,
        placeholder: (_, __) => _placeholder,
        errorWidget: (_, __, ___) => _placeholder,
      ),
    );
  }

  Widget get _placeholder => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(8)),
    child: const Icon(Icons.book, size: 48, color: Colors.grey),
  );
}
