class Patron {
  final int id;
  final String cardBarcode;
  final String fullName;
  final String? email;
  final String? phone;
  final String? address;
  final String patronType;
  final int maxCheckouts;
  final int maxDays;
  final String status;

  Patron({
    required this.id,
    required this.cardBarcode,
    required this.fullName,
    this.email,
    this.phone,
    this.address,
    this.patronType = 'adult',
    this.maxCheckouts = 5,
    this.maxDays = 30,
    this.status = 'active',
  });

  factory Patron.fromJson(Map<String, dynamic> json) => Patron(
    id: json['id'] ?? 0,
    cardBarcode: json['card_barcode'] ?? '',
    fullName: json['full_name'] ?? '',
    email: json['email'],
    phone: json['phone'],
    address: json['address'],
    patronType: json['patron_type'] ?? 'adult',
    maxCheckouts: json['max_checkouts'] ?? 5,
    maxDays: json['max_days'] ?? 30,
    status: json['status'] ?? 'active',
  );

  bool get canBorrow => status == 'active';
}

class Checkout {
  final int id;
  final int itemId;
  final int patronId;
  final String checkoutDate;
  final String dueDate;
  final String? checkinDate;
  final int renewCount;
  final String status;
  final double feeAmount;
  final String? dkcb;
  final String? bookTitle;

  Checkout({
    required this.id,
    required this.itemId,
    required this.patronId,
    required this.checkoutDate,
    required this.dueDate,
    this.checkinDate,
    this.renewCount = 0,
    this.status = 'active',
    this.feeAmount = 0,
    this.dkcb,
    this.bookTitle,
  });

  factory Checkout.fromJson(Map<String, dynamic> json) => Checkout(
    id: json['id'] ?? 0,
    itemId: json['item_id'] ?? 0,
    patronId: json['patron_id'] ?? 0,
    checkoutDate: json['checkout_date'] ?? '',
    dueDate: json['due_date'] ?? '',
    checkinDate: json['checkin_date'],
    renewCount: json['renew_count'] ?? 0,
    status: json['status'] ?? 'active',
    feeAmount: (json['fee_amount'] ?? 0).toDouble(),
    dkcb: json['dkcb'],
    bookTitle: json['book_title'],
  );

  bool get isOverdue => DateTime.parse(dueDate).isBefore(DateTime.now()) && checkinDate == null;
  int get overdueDays => isOverdue ? DateTime.now().difference(DateTime.parse(dueDate)).inDays : 0;
}
