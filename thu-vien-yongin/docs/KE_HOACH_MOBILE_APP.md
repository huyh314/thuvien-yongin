# 📱 KẾ HOẠCH CHI TIẾT — MOBILE APP (FLUTTER)

> OPAC Mobile cho Bạn đọc — Flutter 3.x + Supabase Dart Client
> 4 tuần, 2 devs (1 Flutter + 1 Backend)

---

## 1. KIẾN TRÚC TỔNG THỂ

### 1.1. Cấu trúc dự án

```
mobile-app/
├── android/                          # Android native config
├── ios/                              # iOS native config
├── assets/
│   ├── images/                       # Logo, placeholder book cover
│   ├── fonts/                        # Fonts tiếng Việt
│   └── l10n/                         # i18n files (vi, en)
├── lib/
│   ├── main.dart                     # Entry point + MaterialApp
│   ├── app.dart                      # App widget + router config
│   ├── routes.dart                   # Route definitions (GoRouter)
│   ├── theme/
│   │   ├── app_theme.dart            # ThemeData (light + dark)
│   │   ├── app_colors.dart           # Color constants
│   │   └── app_text_styles.dart      # Typography
│   ├── models/
│   │   ├── book.dart                 # Book, BibItem
│   │   ├── patron.dart               # Patron, Checkout
│   │   ├── notification.dart         # Notification model
│   │   └── api_response.dart         # Generic API response wrapper
│   ├── services/
│   │   ├── api_client.dart           # Dio HTTP client + interceptor
│   │   ├── auth_service.dart         # Login, register, token refresh
│   │   ├── book_service.dart         # Search, detail, newest
│   │   ├── patron_service.dart       # Patron profile, history, wishlist
│   │   ├── notification_service.dart  # FCM + Supabase realtime
│   │   ├── storage_service.dart      # SharedPreferences/Hive local cache
│   │   └── scanner_service.dart      # Barcode/QR scanner
│   ├── state/                        # State management (Provider/Riverpod)
│   │   ├── auth_provider.dart        # Auth state
│   │   ├── search_provider.dart      # Search state
│   │   ├── book_provider.dart        # Book detail
│   │   ├── patron_provider.dart      # Patron data
│   │   └── notification_provider.dart # Notifications
│   ├── screens/
│   │   ├── splash_screen.dart        # Splash / loading
│   │   ├── home/
│   │   │   ├── home_screen.dart      # Home page (Màn hình chính)
│   │   │   └── widgets/
│   │   │       ├── search_bar.dart
│   │   │       ├── category_chips.dart
│   │   │       ├── newest_books.dart
│   │   │       └── news_banner.dart
│   │   ├── search/
│   │   │   ├── search_screen.dart    # Search + results
│   │   │   └── widgets/
│   │   │       ├── search_filters.dart
│   │   │       ├── search_results_list.dart
│   │   │       └── book_card.dart
│   │   ├── book_detail/
│   │   │   ├── book_detail_screen.dart # Book detail
│   │   │   └── widgets/
│   │   │       ├── marc_view.dart
│   │   │       └── review_section.dart
│   │   ├── auth/
│   │   │   ├── login_screen.dart     # Đăng nhập
│   │   │   └── register_screen.dart  # Đăng ký
│   │   ├── profile/
│   │   │   ├── profile_screen.dart   # Hồ sơ cá nhân
│   │   │   ├── digital_card_screen.dart # Thẻ thư viện số (QR)
│   │   │   ├── checkouts_screen.dart  # Sách đang mượn
│   │   │   ├── history_screen.dart    # Lịch sử mượn/trả
│   │   │   ├── wishlist_screen.dart   # Yêu thích
│   │   │   └── notifications_screen.dart # Thông báo
│   │   └── scanner/
│   │       └── scanner_screen.dart   # Quét barcode/QR
│   └── widgets/                      # Shared widgets
│       ├── app_scaffold.dart         # Scaffold wrapper
│       ├── loading_widget.dart       # Loading indicator
│       ├── error_widget.dart         # Error state
│       ├── empty_widget.dart         # Empty state
│       ├── rating_stars.dart         # Star rating widget
│       └── cached_image.dart         # Image with cache + placeholder
├── test/
│   ├── services/
│   └── screens/
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

### 1.2. Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | **Flutter 3.x (Dart 3)** | Cross-platform, hot reload, hiệu năng cao |
| State | **Riverpod 2.x** | Provider phiên bản nâng cao, compile-safe |
| HTTP | **Dio 5.x** | Interceptors, retry, file download |
| Database local | **Hive** hoặc **SharedPreferences** | Cache token, settings, offline data |
| Router | **GoRouter 14.x** | Declarative routing, deep link |
| Barcode/QR | **mobile_scanner 5.x** | Quét mã vạch/QR realtime |
| Push notif | **Firebase Cloud Messaging (FCM)** | Thông báo đẩy |
| Realtime | **Supabase Dart Client** | Database realtime (thông báo) |
| Auth token | **flutter_secure_storage** | Lưu JWT an toàn |
| UI | Material Design 3 | Chuẩn Android + iOS |

### 1.3. pubspec.yaml

```yaml
name: yongin_reader
description: OPAC Mobile - Thư viện Yongin
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # Network
  dio: ^5.4.0
  supabase: ^2.2.0

  # Router
  go_router: ^14.0.0

  # UI
  google_fonts: ^6.2.0
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0            # Skeleton loading
  flutter_rating_bar: ^4.0.0

  # Scanner
  mobile_scanner: ^5.1.0
  qr_flutter: ^4.1.0          # Generate QR code

  # Storage
  flutter_secure_storage: ^9.2.0
  shared_preferences: ^2.3.0

  # Push notification
  firebase_core: ^3.1.0
  firebase_messaging: ^15.0.0

  # Utils
  intl: ^0.19.0               # Date/time formatting
  url_launcher: ^6.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.0
```

---

## 2. CHI TIẾT MÀN HÌNH

### 2.1. Splash Screen → Home Screen

```
┌──────────────────────┐
│                      │
│   🏛️  YONGIN        │    ← Logo + Loading
│   Thư viện số       │
│   cộng đồng         │
│                      │
│   ⏳ Đang tải...    │
│                      │
└──────────────────────┘
         │
         ▼  (Check auth token)
         │
    ┌────┴────┐
    │         │
 Có token  Không token
    │         │
    ▼         ▼
┌──────────┐ ┌──────────┐
│ Home     │ │ Home     │
│ (có menu)│ │ (guest)  │
└──────────┘ └──────────┘
```

### 2.2. Home Screen

```
┌──────────────────────────────┐
│  Thư viện Yongin    [🔔][👤] │ ← AppBar
├──────────────────────────────┤
│  ╔══════════════════════════╗│
│  ║ 🔍 Tìm kiếm sách...    ║│ ← SearchBar (tap → SearchScreen)
│  ╚══════════════════════════╝│
│                              │
│  [📖 Toàn bộ][✍️ TG][📕 ND][🏷️ CĐ] │ ← CategoryChips (Scroll ngang)
│                              │
│  ┌──────────┐ ┌──────────┐  │
│  │ Sách mới │ │ Bán chạy │  │ ← CategoryChips
│  │ 🔴       │ │ 🟠       │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ Thiếu nhi│ │ Khoa học │  │
│  │ 🟢       │ │ 🔵       │  │
│  └──────────┘ └──────────┘  │
│                              │
│  ⭐ SÁCH MỚI NHẤT            │
│  ┌────┐ ┌────┐ ┌────┐       │ ← Horizontal ListView
│  │ 📖 │ │ 📖 │ │ 📖 │       │
│  │Sách│ │Sách│ │Sách│       │   Card bìa sách
│  │ 1  │ │ 2  │ │ 3  │       │   (CachedNetworkImage)
│  └────┘ └────┘ └────┘       │
│                              │
│  📰 TIN TỨC & SỰ KIỆN       │
│  🗓️ Ngày hội Sách 2026     │
│  🗓️ Hội thi Kể chuyện      │
│                              │
├──────────────────────────────┤
│  [🏠]  [🔍]  [📚]  [👤]     │ ← Bottom Navigation
└──────────────────────────────┘
```

**Bottom Navigation:**
| Tab | Icon | Label | Route |
|-----|------|-------|-------|
| 1 | 🏠 | Trang chủ | `/` |
| 2 | 🔍 | Tìm kiếm | `/search` |
| 3 | 📚 | Của tôi | `/checkouts` (nếu đã login) hoặc `/login` |
| 4 | 👤 | Tài khoản | `/profile` |

### 2.3. Search Screen

```
┌──────────────────────────────┐
│  🔍 [Tìm kiếm...          ]  │ ← TextField + debounce 300ms
├──────────────────────────────┤
│  Bộ lọc: [Cơ bản ▼] [... ]  │ ← Chips (tác giả, năm, kho...)
│                              │
│  💡 Gợi ý: "văn hóa", "văn  │ ← Suggestions list
│  học", "văn minh"            │
│                              │
│  ───── KẾT QUẢ (142) ─────  │
│  ┌────────────────────────┐  │
│  │ 📖 Văn hóa Việt Nam    │  │ ← BookCard (dạng list)
│  │ Trần Quốc Vượng · 2023│  │
│  │ ⭐ 4.5 · Còn 2 bản     │  │
│  │ [Chi tiết]  [Đặt mượn] │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 📖 📖 📖               │  │   Có thể toggle Grid/List
│  │ books                  │  │
│  └────────────────────────┘  │
│                              │
│  ◀ 1  2  3  ...  15 ▶       │ ← Pagination
└──────────────────────────────┘
```

### 2.4. Book Detail Screen

```
┌──────────────────────────────┐
│  ← Quay lại         [❤️][📤]│ ← AppBar + action buttons
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │                          ││ ← Hero animation ảnh bìa
│  │       ẢNH BÌA SÁCH       ││
│  │                          ││
│  └──────────────────────────┘│
│                              │
│  📖 VĂN HÓA VIỆT NAM        │
│  ✍️ Trần Quốc Vượng         │
│  ⭐ 4.5/5 (23 đánh giá)     │
│                              │
│  ┌──────────────────────────┐│
│  │ 📋 Thông tin thư mục     ││ ← ExpansionTile
│  │  NXB: Văn hóa — 2023    ││
│  │  ISBN: 978-604-77-6729-8││
│  │  456 tr. : minh hoạ     ││
│  │  🌐 Tiếng Việt          ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📝 Tóm tắt               ││ ← ExpansionTile
│  │  Tác phẩm trình bày...   ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📍 Tình trạng kho        ││
│  │  ├ Kho Mượn: Còn 2 bản  ││ ← 🟢/🔴 status
│  │  ├ Kho Đọc: Còn 1 bản   ││
│  │  └ Kho Số hóa: Online   ││
│  └──────────────────────────┘│
│                              │
│  [Xem MARC21]  [Đánh giá]   │← Bottom buttons
└──────────────────────────────┘
```

### 2.5. QR Code Scanner (Mượn sách)

```
┌──────────────────────────────┐
│  Quét QR / Mã vạch           │
├──────────────────────────────┤
│                              │
│        ┌──────────┐          │
│        │          │          │ ← Camera preview
│        │  CAMERA  │          │   (mobile_scanner)
│        │  VIEW    │          │
│        │          │          │
│        └──────────┘          │
│                              │
│  Hướng dẫn: Đặt mã QR/vạch   │
│  vào giữa khung hình         │
│                              │
│  [Nhập tay]  [Bật/Tắt đèn]  │
└──────────────────────────────┘
         │
         ▼ (onScan)
┌──────────────────────────────┐
│  ✅ Mượn thành công!         │ ← BottomSheet
│  📖 Văn hóa Việt Nam        │
│  📅 Hạn trả: 12/07/2026     │
│  ─────────────────────       │
│  [OK]  [Tiếp tục mượn]      │
└──────────────────────────────┘
```

### 2.6. Thẻ thư viện số (Digital Card)

```
┌──────────────────────────────┐
│  🆔 Thẻ thư viện số          │
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │   THƯ VIỆN YONGIN        ││
│  │                          ││
│  │   ┌──────────────────┐   ││
│  │   │                  │   ││ ← QR Code (qr_flutter)
│  │   │   QR CODE         │   ││
│  │   │   (mã TV000123)   │   ││
│  │   │                  │   ││
│  │   └──────────────────┘   ││
│  │                          ││
│  │   NGUYỄN VĂN AN          ││
│  │   TV000123                ││
│  │   Người lớn               ││
│  │                          ││
│  └──────────────────────────┘│
│                              │
│  [Chia sẻ thẻ]  [Tải xuống] │
└──────────────────────────────┘
```

### 2.7. Thông báo + Push Notification

```
┌──────────────────────────────┐
│  🔔 Thông báo         [Xóa]  │
├──────────────────────────────┤
│  ┌──────────────────────────┐│
│  │ 🔵 ⏰ Sắp đến hạn!       ││ ← Chưa đọc (blue dot)
│  │ Văn hóa Việt Nam         ││
│  │ Hạn trả: 12/07/2026      ││
│  │ Còn 5 ngày               ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │ ⚪ 📚 Sách mới           ││ ← Đã đọc
│  │ Đã có sách mới về chủ   ││
│  │ đề Văn hóa               ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │ ⚪ ✅ Đặt mượn thành công││
│  │ Lịch sử Việt Nam đã có   ││
│  │ sẵn tại quầy             ││
│  └──────────────────────────┘│
└──────────────────────────────┘

Push Notification (khi app đóng):
┌──────────────────────────────┐
│  🔔 THƯ VIỆN YONGIN        │ ← System notification
│  ⏰ Văn hóa Việt Nam sắp   │
│  đến hạn trả (còn 5 ngày)  │
│  [Trả ngay]                  │ ← Deep link action
└──────────────────────────────┘
```

---

## 3. BACKEND API CẦN THÊM

### 3.1. API Mới cho Mobile

| Method | Endpoint | Mô tả | Mobile dùng ở đâu |
|--------|----------|-------|-------------------|
| GET | `/api/patron/barcode-scan/{code}` | Tra cứu nhanh sách qua mã vạch | Scanner → Kiểm tra sách |
| POST | `/api/patron/{id}/fcm-token` | Lưu FCM token | Push notification |
| GET | `/api/opac/mobile/newest` | Sách mới cho mobile (có ảnh thumbnail) | HomeScreen | 
| GET | `/api/patron/{id}/digital-card` | Lấy QR code data thẻ | DigitalCardScreen |
| POST | `/api/patron/{id}/borrow-by-qr` | Mượn qua QR code (ko cần thủ thư) | Scanner |

### 3.2. Backend Code — Scanner API

```javascript
// backend/src/modules/patron/routes/patronRoutes.js — thêm route:

/**
 * GET /api/patron/barcode-scan/:code
 * Tra cứu nhanh sách qua mã vạch — dùng cho app mobile
 */
router.get('/barcode-scan/:code', async (req, res) => {
  try {
    const item = await itemService.findByBarcode(req.params.code);
    if (!item) return res.json({ found: false });
    const bib = await bibService.findById(item.bib_id);
    return res.json({ 
      found: true,
      item: { id: item.id, dkcb: item.dkcb, status: item.status, shelfSection: item.shelf_section },
      book: { id: bib.id, title: bib.title, author: bib.author_main, coverUrl: bib.cover_url }
    });
  } catch (error) {
    return res.json({ found: false });
  }
});
```

### 3.3. FCM Push Notification Service

```javascript
// backend/src/services/notificationService.js — thêm function:

const admin = require('firebase-admin');

// Khởi tạo Firebase Admin SDK (1 lần)
admin.initializeApp({ credential: admin.credential.cert(require('./firebase-key.json')) });

async function sendPushNotification(patronId, title, body, data = {}) {
  // Lấy FCM tokens của patron
  const { data: tokens } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('patron_id', patronId)
    .eq('active', true);

  if (!tokens || tokens.length === 0) return;

  const messages = tokens.map(t => ({
    notification: { title, body },
    data,
    token: t.token,
  }));

  return Promise.all(messages.map(msg => admin.messaging().send(msg)));
}
```

---

## 4. DATA FLOW & STATE MANAGEMENT

### 4.1. Riverpod Provider Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     RIVERPOD PROVIDERS                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  authProvider (StateNotifierProvider)                    │
│  ├── state: AuthState { user, token, isLoggedIn }       │
│  ├── login(email, pw) → API call → set state            │
│  ├── register(data) → API call → set state              │
│  ├── logout() → clear secure storage                    │
│  └── restoreToken() → read secure storage               │
│                                                         │
│  searchProvider (StateNotifierProvider)                  │
│  ├── state: SearchState { query, results, loading }     │
│  ├── search(q, type) → API call → set state             │
│  ├── loadMore() → next page                             │
│  └── clearResults()                                     │
│                                                         │
│  bookProvider (FutureProvider.family)                    │
│  ├── bookProvider(id) → kết quả cached                  │
│  └── tự động invalidate sau 5 phút                      │
│                                                         │
│  patronProvider (StateNotifierProvider)                  │
│  ├── state: PatronState { profile, checkouts, history }  │
│  ├── loadProfile()                                      │
│  ├── loadCheckouts()                                    │
│  └── toggleWishlist(bookId)                             │
│                                                         │
│  notificationProvider (StateNotifierProvider)            │
│  ├── state: NotificationState { items, unreadCount }     │
│  ├── loadNotifications()                                │
│  ├── markRead(id)                                       │
│  └── onRealtimeNew(payload)  ← Supabase realtime        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2. Dio API Client với Token Refresh

```dart
// lib/services/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  late final Dio dio;
  final _storage = const FlutterSecureStorage();

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: 'https://thuvienyongin.vn/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Try refresh token
          final refreshToken = await _storage.read(key: 'refreshToken');
          if (refreshToken != null) {
            try {
              final response = await dio.post('/auth/refresh', data: {
                'refreshToken': refreshToken,
              });
              await _storage.write(key: 'accessToken', value: response.data['accessToken']);
              error.requestOptions.headers['Authorization'] = 
                'Bearer ${response.data['accessToken']}';
              // Retry
              final retry = await dio.fetch(error.requestOptions);
              handler.resolve(retry);
              return;
            } catch (_) {
              // Refresh failed → logout
              await _storage.deleteAll();
            }
          }
        }
        handler.next(error);
      },
    ));
  }
}
```

---

## 5. SPRINT KẾ HOẠCH (4 TUẦN)

### Sprint 1: Foundation (Tuần 1)

```
Ngày 1-2: Setup Flutter project
  - flutter create yongin_reader
  - Cấu hình pubspec.yaml (dependencies)
  - Cấu hình Android (minSdk 21) + iOS (min 14)
  - Cấu hình Firebase (google-services.json + GoogleService-Info.plist)
  - Cấu hình theme (Material 3, colors, fonts)

Ngày 3-4: Core architecture
  - Tạo models: Book, Patron, Notification, ApiResponse
  - Tạo services: ApiClient (Dio + interceptor), AuthService
  - Tạo AuthProvider (login, register, logout, token restore)
  - Tạo SplashScreen (check auth → route)

Ngày 5: Navigation
  - Cấu hình GoRouter (routes + guards)
  - BottomNavigationBar (4 tabs)
  - AppScaffold (shell route cho bottom nav)
  - Test navigation flow
```

**Deliverables:**
- App chạy được, có splash → home/login
- Auth flow hoàn chỉnh
- Bottom navigation 4 tab

---

### Sprint 2: Core Features (Tuần 2)

```
Ngày 1-2: Home Screen
  - HomeScreen với SearchBar, CategoryChips
  - newestBooks Horizontal ListView (BookCard nhỏ)
  - NewsBanner carousel (nếu có dữ liệu)
  - SearchProvider + BookService.getNewest()
  - Shimmer loading state

Ngày 3-4: Search + Detail
  - SearchScreen với TextField + debounce (300ms)
  - Auto-suggest dropdown
  - Kết quả hiển thị Grid/List toggle
  - SearchFilters bottom sheet (kho, năm, NN)
  - BookDetailScreen (ExpansionTile x3: info, summary, availability)
  - Hero animation ảnh bìa

Ngày 5: Scanner
  - ScannerScreen (mobile_scanner)
  - Xử lý kết quả scan → tra cứu nhanh
  - Mượn qua QR (nếu có thủ thư)
  - Test trên thiết bị thật
```

**Deliverables:**
- Tìm sách + chi tiết hoạt động
- Scanner quét mã vạch/QR

---

### Sprint 3: Account Features (Tuần 3)

```
Ngày 1-2: Auth + Profile
  - LoginScreen (email/mã thẻ + password)
  - RegisterScreen (form đăng ký thẻ)
  - ProfileScreen (avatar, thông tin, logout)
  - EditProfileScreen (cập nhật thông tin)

Ngày 3: My Library
  - CheckoutsScreen (sách đang mượn, còn mấy ngày)
  - HistoryScreen (lịch sử mượn/trả, phân trang)
  - WishlistScreen (sách yêu thích, thêm/xóa)

Ngày 4: Digital Card
  - DigitalCardScreen (QR code thẻ, tên, mã thẻ)
  - Chia sẻ thẻ (screenshot / share intent)
  - Tạo QR từ mã thẻ (qr_flutter)

Ngày 5: Thông báo
  - NotificationsScreen (list thông báo)
  - NotificationProvider (đếm unread, badge)
  - Đánh dấu đã đọc / xóa
```

**Deliverables:**
- Login/Register/Profile hoạt động
- Xem sách đang mượn, lịch sử
- Thẻ thư viện số QR
- Danh sách thông báo

---

### Sprint 4: Polish + Push Notifications (Tuần 4)

```
Ngày 1-2: Push Notifications
  - Cấu hình Firebase Cloud Messaging (Android + iOS)
  - FCM token registration (gửi lên backend)
  - Handle background message (hiển thị + deep link)
  - Foreground message (snackbar/dialog)
  - Notification badge trên icon app + bottom nav

Ngày 3: UI Polish
  - Dark mode theme (dựa trên system settings)
  - Animation transitions (page route, hero)
  - Offline mode (cache newest sách + search history)
  - Pull-to-refresh trên tất cả list
  - Infinite scroll trên search results

Ngày 4: Testing
  - Test trên Android (các kích thước màn hình)
  - Test trên iOS (nếu có thiết bị)
  - Test barcode scanner với mã vạch thật
  - Test push notification (gửi từ backend → nhận trên app)
  - Fix lỗi UI + crash

Ngày 5: Deployment
  - Android: Tạo signed APK/AAB, upload lên Play Store
  - iOS: Tạo archive, upload lên App Store Connect
  - Cập nhật backend CORS cho mobile origin
  - Viết release notes
  - Tạo landing page download
```

**Deliverables:**
- Push notification hoạt động
- Dark mode
- App trên Play Store / App Store

---

## 6. XỬ LÝ ĐẶC BIỆT

### 6.1. Offline Mode

```dart
// Cache newest sách + search history với Hive
@HiveType()
class CachedBook {
  @HiveField(0) final int id;
  @HiveField(1) final String title;
  @HiveField(2) final String author;
  // ...
}

Future<List<Book>> getNewestBooks() async {
  try {
    final books = await bookService.getNewest();
    // Cache lại
    final box = Hive.box<CachedBook>('books_cache');
    await box.put('newest', books.map((b) => CachedBook.fromBook(b)).toList());
    return books;
  } catch (e) {
    // Offline → trả về cache
    final box = Hive.box<CachedBook>('books_cache');
    final cached = box.get('newest');
    if (cached != null) return cached;
    throw Exception('Không có kết nối mạng');
  }
}
```

### 6.2. Deep Link (Push Notification → Mở màn hình)

```dart
// GoRouter deep link config
// Từ push notification: /works/123, /checkouts, /notifications

GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/works/:id', builder: (_, state) =>
      BookDetailScreen(id: int.parse(state.pathParameters['id']!))),
    GoRoute(path: '/checkouts', builder: (_, __) => const CheckoutsScreen()),
  ],
);
```

### 6.3. Supabase Realtime (Thông báo trực tiếp)

```dart
// lib/services/notification_service.dart
import 'package:supabase/supabase.dart';

class NotificationService {
  final supabase = Supabase.instance.client;

  RealtimeChannel? _channel;

  void subscribeToNotifications(int patronId, void Function(Map<String, dynamic>) onNew) {
    _channel = supabase
      .channel('notifications')
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'notifications',
        filter: 'patron_id=eq.$patronId',
        callback: (payload) {
          onNew(payload.newRecord as Map<String, dynamic>);
        },
      )
      .subscribe();
  }

  void unsubscribe() {
    _channel?.unsubscribe();
  }
}
```

### 6.4. Barcode Scanner (Xử lý scan liên tục)

```dart
// lib/services/scanner_service.dart
class ScannerService {
  // Phân biệt mã sách (ĐKCB) và mã thẻ bạn đọc
  BarcodeType identifyCode(String code) {
    if (code.startsWith('TV')) return BarcodeType.patronCard;
    if (code.startsWith('M.') || code.startsWith('Đ.')) return BarcodeType.bookItem;
    return BarcodeType.unknown;
  }

  Future<ScanResult> handleScan(String code) async {
    final type = identifyCode(code);
    switch (type) {
      case BarcodeType.bookItem:
        final result = await apiClient.get('/patron/barcode-scan/$code');
        return ScanResult.book(result.data);
      case BarcodeType.patronCard:
        final result = await apiClient.get('/patron/search?q=$code');
        return ScanResult.patron(result.data);
      default:
        // Thử cả 2
        return ScanResult.unknown;
    }
  }
}
```

---

## 7. BACKLOG KỸ THUẬT

| # | Công việc | Priority | Ghi chú |
|---|-----------|----------|---------|
| B1 | Tạo Firebase project + download key files | 🔴 Cao | Cần cho push notification |
| B2 | Tạo bảng `fcm_tokens` trong Supabase | 🔴 Cao | Lưu device tokens |
| B3 | Tạo API `POST /api/patron/{id}/fcm-token` | 🟡 TB | Lưu token FCM |
| B4 | Tạo API `GET /api/patron/barcode-scan/{code}` | 🟡 TB | Scan sách trả về info |
| B5 | Cấu hình APNs cho iOS push | 🟢 Thấp | Cần Apple Developer account |
| B6 | Tạo Google Play Store listing | 🟢 Thấp | Mô tả, ảnh chụp, icon |
| B7 | CI/CD với Codemagic / GitHub Actions | 🟢 Thấp | Build tự động |
| B8 | Crashlytics cho crash reporting | 🟢 Thấp | Firebase Crashlytics |

---

## 8. TỔNG KẾT

| Hạng mục | Giá trị |
|----------|---------|
| **Số màn hình** | 14 screens |
| **Số widgets** | ~20 widgets |
| **Số providers** | 5 providers (Riverpod) |
| **Dòng code ước tính** | ~8,000-12,000 dòng Dart |
| **Backend API mới** | 5 endpoints |
| **Thời gian** | 4 tuần (1 tháng) |
| **Nhân sự** | 1 Flutter dev + 1 Backend dev |
| **Chi phí ước tính** | ~60-80 triệu VND |

**Kết quả:** 1 app mobile Flutter đầy đủ cho bạn đọc, có push notification, barcode scanner, thẻ số QR, và offline mode.
