import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';

class RatingStars extends StatelessWidget {
  final double rating;
  final double size;
  const RatingStars({super.key, required this.rating, this.size = 16});

  @override
  Widget build(BuildContext context) => RatingBarIndicator(
    rating: rating,
    itemSize: size,
    itemBuilder: (_, __) => const Icon(Icons.star, color: Colors.amber),
    unratedColor: Colors.grey[300],
  );
}
