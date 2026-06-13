class ApiResponse<T> {
  final T? data;
  final String? error;
  final String? message;
  final bool success;

  ApiResponse({this.data, this.error, this.message, this.success = true});

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJson) {
    if (json.containsKey('error')) {
      return ApiResponse(error: json['error'], message: json['message'], success: false);
    }
    return ApiResponse(data: fromJson != null ? fromJson(json) : json as T?, success: true);
  }
}

class PaginatedResult<T> {
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final List<T> results;

  PaginatedResult({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.results,
  });

  factory PaginatedResult.fromJson(Map<String, dynamic> json, T Function(dynamic) fromItem) => PaginatedResult(
    total: json['total'] ?? 0,
    page: json['page'] ?? 1,
    limit: json['limit'] ?? 20,
    totalPages: json['totalPages'] ?? 0,
    results: (json['results'] as List<dynamic>?)?.map((e) => fromItem(e)).toList() ?? [],
  );
}
