class Book {
  final int id;
  final String title;
  final String authorMain;
  final String? isbn;
  final int publishYear;
  final String? publisherName;
  final String? pages;
  final String? sizeCm;
  final String? languageCode;
  final String? summary;
  final List<String> subjects;
  final String? coverUrl;
  final int totalCopies;
  final int availableCopies;
  final bool isAvailable;
  final double rating;

  Book({
    required this.id,
    required this.title,
    required this.authorMain,
    this.isbn,
    required this.publishYear,
    this.publisherName,
    this.pages,
    this.sizeCm,
    this.languageCode,
    this.summary,
    this.subjects = const [],
    this.coverUrl,
    this.totalCopies = 0,
    this.availableCopies = 0,
    this.isAvailable = false,
    this.rating = 0,
  });

  factory Book.fromJson(Map<String, dynamic> json) => Book(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    authorMain: json['author_main'] ?? '',
    isbn: json['isbn'],
    publishYear: json['publish_year'] ?? 0,
    publisherName: json['publisher_name'],
    pages: json['pages'],
    sizeCm: json['size_cm'],
    languageCode: json['language_code'],
    summary: json['summary'],
    subjects: (json['subjects'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    coverUrl: json['cover_url'],
    totalCopies: json['total_copies'] ?? 0,
    availableCopies: json['available_copies'] ?? 0,
    isAvailable: json['is_available'] ?? false,
    rating: (json['rating'] ?? 0).toDouble(),
  );

  String get subtitle => '$authorMain · $publishYear';
}
