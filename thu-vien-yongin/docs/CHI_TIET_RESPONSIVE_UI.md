# 🎨 KẾ HOẠCH CHI TIẾT — RESPONSIVE UI VỚI REACT

> Dựa trên codebase hiện tại (3 file HTML vanilla JS) → React 18 + TypeScript + Ant Design

---

## 1. KIẾN TRÚC TỔNG THỂ

### 1.1. Monorepo với NPM Workspaces

```
thu-vien-yongin/
├── backend/                     # Giữ nguyên
├── frontend/
│   ├── package.json             # Workspace root
│   ├── .eslintrc.cjs
│   ├── tsconfig.base.json
│   └── apps/
│       ├── reader/              # Cổng Bạn đọc (OPAC) — CRA / Vite
│       ├── librarian/           # Cổng Thủ thư
│       ├── admin/               # Cổng Quản trị
│       └── kiosk/               # (Sau này) Kiosk tự mượn
│   └── packages/
│       ├── ui/                  # Component dùng chung
│       ├── api/                 # API client (Supabase + REST)
│       ├── types/               # TypeScript types
│       └── utils/               # Helper functions
├── docs/
└── package.json
```

### 1.2. Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | **React 18 + TypeScript** | Phổ biến nhất, Ant Design support tốt |
| Build tool | **Vite 5** | Nhanh hơn CRA 10x, HMR tức thì |
| UI Kit | **Ant Design 5** | Đầy đủ component, hỗ trợ tiếng Việt |
| Router | **React Router 6** | Chuẩn mực, nested routes |
| State | **React Query (TanStack Query)** | Quản lý API cache, loading, error |
| Form | **Ant Design Form** + **React Hook Form** | Validation, complex form |
| Charts | **Recharts** | SVG-based, responsive |
| i18n | **react-i18next** | Đa ngôn ngữ sau này |
| HTTP | **Axios** | Interceptors, error handling |
| CSS | **Tailwind CSS** (optional) hoặc Ant Design theme | Utility-first |

### 1.3. Quy tắc code

```
1. Mỗi portal là 1 Vite app riêng
2. Dùng chung qua npm workspaces: @yongin/ui, @yongin/api, @yongin/types
3. Component trong packages/ui/ theo Atomic Design
4. Page trong apps/*/pages/
5. Mọi API call qua React Query (không fetch raw)
6. TypeScript strict mode
```

---

## 2. CẤU TRÚC THƯ MỤC CHI TIẾT

### 2.1. Package dùng chung: `packages/ui/`

```
packages/ui/
├── src/
│   ├── index.ts                 ← Export tất cả
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          ← Layout chính (Header + Sidebar + Content)
│   │   │   ├── ReaderLayout.tsx       ← Layout cho OPAC (Header search + Content)
│   │   │   ├── AuthLayout.tsx         ← Layout trang login/register
│   │   │   ├── Header.tsx             ← Header responsive
│   │   │   ├── Sidebar.tsx            ← Sidebar gập được
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── common/
│   │   │   ├── BookCard.tsx           ← Thẻ sách (dùng OPAC + Thủ thư)
│   │   │   ├── BookList.tsx           ← Danh sách sách (Grid/List toggle)
│   │   │   ├── SearchBar.tsx          ← Search + Suggest dropdown
│   │   │   ├── SearchFilters.tsx      ← Bộ lọc (kho, năm, ngôn ngữ, thể loại)
│   │   │   ├── Pagination.tsx         ← Phân trang
│   │   │   ├── Loading.tsx            ← Skeleton loading
│   │   │   ├── EmptyState.tsx         ← Không có dữ liệu
│   │   │   ├── ErrorBoundary.tsx      ← Bắt lỗi React
│   │   │   ├── ConfirmModal.tsx       ← Xác nhận hành động
│   │   │   └── NotificationBell.tsx   ← Chuông thông báo realtime
│   │   ├── marc21/
│   │   │   ├── MarcFieldEditor.tsx    ← Form nhập 1 trường MARC21
│   │   │   ├── MarcRecordForm.tsx     ← Form biên mục đầy đủ
│   │   │   ├── MarcRecordView.tsx     ← Xem biểu ghi MARC21
│   │   │   └── MarcFieldSuggest.tsx   ← Gợi ý DDC, Cutter, từ khóa
│   │   ├── circulation/
│   │   │   ├── CheckoutForm.tsx       ← Form mượn sách
│   │   │   ├── CheckinForm.tsx        ← Form trả sách
│   │   │   ├── PatronCard.tsx         ← Thẻ bạn đọc (quét)
│   │   │   └── FeeDisplay.tsx         ← Hiển thị phí phạt
│   │   └── charts/
│   │       ├── BarChart.tsx           ← Biểu đồ cột
│   │       ├── LineChart.tsx          ← Biểu đồ đường
│   │       ├── PieChart.tsx           ← Biểu đồ tròn
│   │       └── StatCard.tsx           ← Thẻ thống kê
│   ├── hooks/
│   │   ├── useAuth.ts                 ← Auth context + token management
│   │   ├── useSupabase.ts             ← Supabase client
│   │   ├── useMediaQuery.ts           ← Responsive breakpoints
│   │   ├── useDebounce.ts             ← Debounce search input
│   │   └── usePagination.ts           ← Phân trang
│   ├── styles/
│   │   ├── theme.ts                   ← Ant Design theme override
│   │   ├── global.css                 ← Global styles
│   │   └── variables.css              ← CSS variables
│   └── types/
│       ├── book.ts                    ← Book, BibItem, Item types
│       ├── patron.ts                  ← Patron type
│       ├── marc.ts                    ← MARC21 types
│       ├── circulation.ts             ← Circulation types
│       ├── user.ts                    ← User/Role types
│       └── api.ts                     ← API response types
├── package.json
└── tsconfig.json
```

### 2.2. Portal Cổng Bạn đọc: `apps/reader/`

```
apps/reader/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
├── src/
│   ├── main.tsx                      ← Entry point
│   ├── App.tsx                       ← Router config
│   ├── routes.tsx                    ← Định nghĩa route
│   ├── pages/
│   │   ├── HomePage.tsx              ← Trang chủ OPAC
│   │   ├── SearchResultsPage.tsx     ← Kết quả tìm kiếm
│   │   ├── BookDetailPage.tsx        ← Chi tiết sách
│   │   ├── LoginPage.tsx             ← Đăng nhập bạn đọc
│   │   ├── RegisterPage.tsx          ← Đăng ký thẻ
│   │   ├── ProfilePage.tsx           ← Khu vực cá nhân
│   │   ├── CheckoutsPage.tsx         ← Sách đang mượn
│   │   ├── HistoryPage.tsx           ← Lịch sử mượn/trả
│   │   ├── WishlistPage.tsx          ← Sách yêu thích
│   │   ├── NotificationsPage.tsx     ← Thông báo
│   │   └── NotFoundPage.tsx          ← 404
│   ├── components/                   ← Page-specific components
│   │   ├── NewestBooks.tsx           ← Sách mới nhất (homepage)
│   │   ├── FeaturedCategories.tsx    ← Danh mục nổi bật
│   │   ├── NewsList.tsx              ← Tin tức sự kiện
│   │   ├── BookRating.tsx            ← Đánh giá sao
│   │   └── DigitalCard.tsx           ← Thẻ thư viện số
│   └── services/                     ← API calls
│       ├── searchApi.ts
│       ├── bookApi.ts
│       └── patronApi.ts
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

### 2.3. Portal Cổng Thủ thư: `apps/librarian/`

```
apps/librarian/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx         ← Dashboard thủ thư
│   │   ├── CatalogingPage.tsx        ← Biên mục MARC21
│   │   ├── CatalogingDuplicate.tsx   ← Tra trùng
│   │   ├── CirculationCheckout.tsx   ← Mượn sách
│   │   ├── CirculationCheckin.tsx    ← Trả sách
│   │   ├── PatronSearchPage.tsx      ← Tìm kiếm bạn đọc
│   │   ├── PatronDetailPage.tsx      ← Chi tiết bạn đọc
│   │   ├── CollectionPage.tsx        ← Quản lý kho
│   │   ├── CollectionTransfer.tsx    ← Chuyển kho
│   │   ├── CollectionInventory.tsx   ← Kiểm kê
│   │   ├── AcquisitionPage.tsx       ← Tiếp nhận TNTT
│   │   ├── PrintingPage.tsx          ← In ấn
│   │   ├── OverdueList.tsx           ← Sách quá hạn
│   │   └── MarcRecordViewer.tsx      ← Xem biểu ghi MARC21
│   └── services/
│       ├── catalogingApi.ts
│       ├── circulationApi.ts
│       ├── patronApi.ts
│       └── collectionApi.ts
├── index.html
└── ...
```

### 2.4. Portal Cổng Quản trị: `apps/admin/`

```
apps/admin/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx         ← Dashboard admin (biểu đồ)
│   │   ├── StaffManagementPage.tsx   ← Quản lý nhân sự
│   │   ├── RoleManagementPage.tsx    ← Phân quyền
│   │   ├── ReportsPage.tsx           ← Báo cáo (tabs)
│   │   ├── ReportDetail.tsx          ← Chi tiết báo cáo
│   │   ├── SystemConfigPage.tsx      ← Cấu hình hệ thống
│   │   ├── StandardsPage.tsx         ← Danh mục chuẩn
│   │   ├── CutterTablePage.tsx       ← Bảng Cutter
│   │   ├── LanguageCodesPage.tsx     ← Mã ngôn ngữ
│   │   └── AuditLogPage.tsx          ← Nhật ký hệ thống
│   └── services/
│       ├── staffApi.ts
│       ├── reportApi.ts
│       ├── configApi.ts
│       └── standardApi.ts
├── index.html
└── ...
```

---

## 3. CHI TIẾT MÀN HÌNH

### 3.1. Trang chủ OPAC (Reader)

```
┌────────────────────────────────────────────────────────┐
│  🏛️ THƯ VIỆN YONGIN     [🌐 EN/VN]  [👤 Đăng nhập]  │ ← Header
├────────────────────────────────────────────────────────┤
│                                                        │
│  ╔══════════════════════════════════════════════════╗   │
│  ║  🔍 Tìm kiếm tài liệu...                       ║   │ ← SearchBar
│  ║  [📖 Toàn bộ] [✍️ Tác giả] [📕 Nhan đề] [🏷️ Chủ đề] ║   │
│  ╚══════════════════════════════════════════════════╝   │
│                                                        │
│  🔥 DANH MỤC NỔI BẬT  (Scroll ngang trên mobile)      │ ← FeaturedCategories
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Sách │ │ Bán  │ │Thiếu │ │Khoa  │ │Văn   │        │
│  │ mới  │ │ chạy │ │nhi   │ │học   │ │học   │        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                                        │
│  ⭐ SÁCH MỚI NHẤT  [Xem tất cả →]                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ ← BookList (Grid)
│  │ 📖 Bìa  │ │ 📖 Bìa  │ │ 📖 Bìa  │ │ 📖 Bìa  │  │
│  │ sách    │ │ sách    │ │ sách    │ │ sách    │  │
│  │ Tên sách│ │ Tên sách│ │ Tên sách│ │ Tên sách│  │
│  │ Tác giả │ │ Tác giả │ │ Tác giả │ │ Tác giả │  │
│  │ ⭐ 4.5  │ │ ⭐ 4.2  │ │ ⭐ 4.8  │ │ ⭐ 4.0  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                        │
│  📰 TIN TỨC & SỰ KIỆN                                  │ ← NewsList
│  🗓️ 02/05  Ngày hội Sách Đà Nẵng 2026                │
│  🗓️ 16/05  Hội thi Kể chuyện theo sách                │
│                                                        │
├────────────────────────────────────────────────────────┤
│  © 2026 CÔNG TY KPT · Phần mềm Thư viện Yongin        │ ← Footer
└────────────────────────────────────────────────────────┘
```

**State management:**
```typescript
// pages/HomePage.tsx
const HomePage = () => {
  const { data: newestBooks, isLoading } = useQuery({
    queryKey: ['newestBooks'],
    queryFn: () => bookApi.getNewest(8),
  });

  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => opacApi.getFeatured(),
  });

  return (
    <ReaderLayout>
      <SearchBar onSearch={(q) => navigate(`/search?q=${q}`)} />
      <FeaturedCategories topics={featured?.topics} />
      <BookList title="Sách mới nhất" books={newestBooks} loading={isLoading} />
      <NewsList />
    </ReaderLayout>
  );
};
```

**Responsive breakpoints:**
```typescript
// useMediaQuery.ts
const breakpoints = {
  xs: 480,   // Mobile nhỏ
  sm: 576,   // Mobile lớn
  md: 768,   // Tablet
  lg: 992,   // Desktop nhỏ
  xl: 1200,  // Desktop
  xxl: 1600, // Desktop lớn
};

// BookList: Grid thay đổi theo màn hình
// xs: 1 cột, sm: 2 cột, md: 3 cột, lg: 4 cột, xl: 5 cột
```

### 3.2. Kết quả tìm kiếm (Reader)

```
┌────────────────────────────────────────────────────────┐
│  🔍 KẾT QUẢ: "văn hóa"     (142 kết quả — 0.32s)     │
│  💡 Gợi ý: "văn hóa việt nam", "văn hóa đọc"         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📁 Bộ lọc:          📅 Năm:    📚 Kho:    🌐 NN:     │ ← SearchFilters
│  [Cơ bản▼] [...     ] [...    ] [...    ] [...    ]   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📖 Văn hóa Việt Nam — Trần Quốc Vượng           │  │
│  │    NXB: Văn hóa, 2023 · 456 tr. · 24 cm         │  │ ← BookCard (List mode)
│  │    🏷️ Văn hóa · Lịch sử · Việt Nam              │  │
│  │    📍 Kho Mượn — ✅ Còn 2 bản  ⭐ 4.5/5         │  │
│  │    [📌 Lưu] [🔄 Đặt mượn] [📖 Chi tiết]        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ◀ 1 2 3 ... 15 ▶                                      │ ← Pagination
└────────────────────────────────────────────────────────┘
```

**Debounce search:**
```typescript
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // 300ms delay

  const { data: suggestions } = useQuery({
    queryKey: ['suggest', debouncedQuery],
    queryFn: () => opacApi.suggest(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <AutoComplete
      options={suggestions?.map(s => ({ value: s.text, label: s.text }))}
      onSelect={(val) => navigate(`/search?q=${val}`)}
    >
      <Input.Search
        size="large"
        placeholder="🔍 Tìm kiếm tài liệu..."
        onChange={e => setQuery(e.target.value)}
      />
    </AutoComplete>
  );
};
```

### 3.3. Chi tiết sách (Reader)

```
┌────────────────────────────────────────────────────────┐
│  ◀ Quay lại kết quả                                    │
├────────────────────────────────────────────────────────┤
│  ┌────────────────┐   📖 VĂN HÓA VIỆT NAM             │
│  │                │                                    │
│  │  ẢNH BÌA SÁCH  │   ✍️ Trần Quốc Vượng              │
│  │                │   📄 NXB: Văn hóa — 2023           │
│  │                │   🆔 ISBN: 978-604-77-6729-8       │
│  └────────────────┘   📄 456 tr. : minh hoạ ; 24 cm   │
│                        🌐 Tiếng Việt                    │
│  ⭐ 4.5/5 (23 đánh giá)   [📌 Yêu thích] [🔄 Mượn]   │
│                                                        │
│  ──────────────────────────────────────────────────    │
│  📝 TÓM TẮT:                                           │
│  Tác phẩm trình bày một cái nhìn toàn cảnh về...       │
│                                                        │
│  📍 THÔNG TIN LƯU TRỮ:                                 │
│  ├─ Kho Mượn     — ĐKCB: M.102568 — ✅ Còn 2 bản     │
│  ├─ Kho Đọc      — ĐKCB: Đ.20456  — ✅ Còn 1 bản     │
│  └─ Kho Số hóa   — Xem online    — ✅ Truy cập mở    │
│                                                        │
│  [📋 Xem MARC21] [📥 Tải PDF]                         │
└────────────────────────────────────────────────────────┘
```

### 3.4. Biên mục MARC21 (Thủ thư)

```
┌────────────────────────────────────────────────────────┐
│  📝 BIÊN MỤC MARC21              Đợt xử lý: PN-2026-05│
├────────────────────────────────────────────────────────┤
│  ⚠️ TRA TRÙNG                                          │
│  Tên: [Văn hóa Việt Nam      ] TG: [Trần Quốc Vượng]  │
│  [🔍 Kiểm tra]  ✅ Tìm thấy 2 biểu ghi trùng!        │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📄 Văn hóa Việt Nam — Trần Quốc Vượng — 2023  │   │
│  │ [📥 Tải biểu ghi] [📝 Biên mục mới]           │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  📋 FORM BIÊN MỤC                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │ Trường    | Giá trị                          │   │ ← MarcRecordForm
│  │───────────┼───────────────────────────────────│   │
│  │ [020] $a  | [9786047767298...................]│   │
│  │ [020] $c  | [169000đ........................]│   │
│  │ [041] $a  | [vie ▼..........................]│   │
│  │ [082] $2  | [23 ▼]  [082] $a [332.6324] $b [D430T ✨]│   │
│  │ [100] $a  | [Trần Quốc Vượng................]│   │
│  │ [245] $a  | [Văn hóa Việt Nam...............]│   │
│  │ [245] $c  | [Trần Quốc Vượng...............]│   │
│  │ [260] $a  | [Hà Nội........................]│   │
│  │ [260] $b  | [Thanh niên....................]│   │
│  │ [260] $c  | [2023..........................]│   │
│  │ [300] $a  | [456 tr. :....................]│   │
│  │ [300] $b  | [minh hoạ......................]│   │
│  │ [300] $c  | [24 cm........................]│   │
│  │ [650] $a  | [Văn hóa ✨ TVQG..............]│   │
│  │ [852] $a  | [Thư viện Đà Nẵng.............]│   │
│  │ [852] $b  | [Kho Mượn ▼..................]│   │
│  │ [852] $j  | [M.102568....................]│   │
│  │ [+ Thêm trường]                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  [💾 Lưu] [🔄 Lưu & thêm] [👁️ Xem trước MARC21]    │
└────────────────────────────────────────────────────────┘
```

### 3.5. Dashboard Admin

```
┌────────────────────────────────────────────────────────┐
│  🏛️ ADMIN — THƯ VIỆN YONGIN       [👤 Admin] [⚙️]   │
├────────────────────────────────────────────────────────┤
│  📊 TỔNG QUAN                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ 📚     │ │ 👤     │ │ 🔄    │ │ ⏰    │         │ ← StatCard x4
│  │ 25,430 │ │ 3,245  │ │ 1,230 │ │ 156   │         │
│  │ Đầu    │ │ Bạn    │ │ Mượn/  │ │ Quá   │         │
│  │ tài    │ │ đọc    │ │ tháng  │ │ hạn   │         │
│  │ liệu   │ │        │ │        │ │       │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                        │
│  📈 HOẠT ĐỘNG 30 NGÀY QUA                              │
│  ┌────────────────────────────────────────────────┐   │ ← LineChart
│  │  ▐█▌    ▐█▌                                    │   │
│  │  ▐█▌ ▐█▌ ▐█▌                                   │   │
│  │  ▐█▌ ▐█▌ ▐█▌ ▐█▌ ▐█▌                           │   │
│  │  └────────────────────────────▶                │   │
│  │  Mượn ██  Trả ██  Quá hạn ██                   │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  📊 PHÂN LOẠI DDC                                      │
│  ┌──────────┐  ┌─────────────────────────────────┐    │
│  │ 🥧       │  │ 000 — Tin học: 12%              │    │ ← PieChart + Legend
│  │ Văn hóa  │  │ 100 — Triết học: 8%            │    │
│  │ 25%     │  │ 200 — Tôn giáo: 3%              │    │
│  │          │  │ 300 — Xã hội: 15%              │    │
│  └──────────┘  │ ...                              │    │
│                └─────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

## 4. API INTEGRATION (REACT QUERY)

### 4.1. Api Client (`packages/api/`)

```typescript
// packages/api/src/client.ts
import axios from 'axios';
import { useAuthStore } from '@yongin/utils';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 4.2. Query hooks pattern

```typescript
// packages/api/src/books.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// Types
export interface Book {
  id: number;
  title: string;
  authorMain: string;
  isbn: string;
  publishYear: number;
  availableCopies: number;
  coverUrl: string | null;
}

// Query keys
export const bookKeys = {
  all: ['books'] as const,
  newest: (limit: number) => [...bookKeys.all, 'newest', limit] as const,
  search: (q: string) => [...bookKeys.all, 'search', q] as const,
  detail: (id: number) => [...bookKeys.all, 'detail', id] as const,
};

// Hooks
export function useNewestBooks(limit = 12) {
  return useQuery({
    queryKey: bookKeys.newest(limit),
    queryFn: () => apiClient.get<Book[]>(`/opac/newest?limit=${limit}`).then(r => r.data),
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: bookKeys.search(query),
    queryFn: () => apiClient.get(`/opac/search?q=${encodeURIComponent(query)}`).then(r => r.data),
    enabled: query.length >= 2, // Chỉ search khi >=2 ký tự
  });
}

export function useBookDetail(id: number) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => apiClient.get(`/opac/works/${id}`).then(r => r.data),
    enabled: !!id,
  });
}
```

### 4.3. Auth Store (Zustand)

```typescript
// packages/utils/src/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: {
    id: number;
    username: string;
    fullName: string;
    roleId: number;
    roleName: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (username, password) => {
        const { data } = await apiClient.post('/auth/login', { username, password });
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const { data } = await apiClient.post('/auth/refresh', { refreshToken });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        } catch {
          get().logout();
        }
      },
    }),
    { name: 'yongin-auth' }
  )
);
```

---

## 5. RESPONSIVE DESIGN CHI TIẾT

### 5.1. Ant Design Theme Override

```typescript
// packages/ui/src/styles/theme.ts
import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0f3460',     // Xanh dương đậm (brand color)
    colorSuccess: '#27ae60',      // Xanh lá
    colorWarning: '#f39c12',      // Cam
    colorError: '#e74c3c',        // Đỏ
    borderRadius: 8,
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#1a1a2e',
      headerHeight: 64,
      siderBg: '#16213e',
    },
    Menu: {
      darkItemBg: '#16213e',
      darkItemSelectedBg: '#0f3460',
    },
    Card: {
      paddingLG: 20,
    },
  },
};
```

### 5.2. Responsive Layout Components

```typescript
// packages/ui/src/components/layout/ReaderLayout.tsx

// Mobile (<768px):
// ┌──────────────┐
// │ 🏛️ Header   │  ← Logo + Hamburger menu + Đăng nhập
// ├──────────────┤
// │ 🔍 Search   │
// ├──────────────┤
// │ 📚 Content  │  ← Full width, 1 column
// ├──────────────┤
// │ 📄 Footer   │
// └──────────────┘

// Tablet (768-992px):
// ┌──────────────┐
// │ 🏛️ Header   │
// ├──────────────┤
// │ 🔍 Search   │
// ├──────────────┤
// │ 📚 Content  │  ← 2 columns grid
// └──────────────┘

// Desktop (>992px):
// ┌──────────────────────────┐
// │ 🏛️ Header               │
// ├──────────────────────────┤
// │ 🔍 Search (centered)    │
// ├──────────────────────────┤
// │ 📚 Content (4 columns)  │
// └──────────────────────────┘
```

### 5.3. CSS-in-JS with Ant Design

```typescript
// Sử dụngAnt Design's responsive grid
import { Row, Col, Grid } from 'antd';
const { useBreakpoint } = Grid;

const BookGrid = ({ books }) => {
  const screens = useBreakpoint();
  const cols = screens.xxl ? 6 : screens.xl ? 5 : screens.lg ? 4
             : screens.md ? 3 : screens.sm ? 2 : 1;

  return (
    <Row gutter={[16, 16]}>
      {books.map(book => (
        <Col key={book.id} span={24 / cols}>
          <BookCard book={book} />
        </Col>
      ))}
    </Row>
  );
};
```

---

## 6. TRIỂN KHAI TỪNG BƯỚC

### Sprint 1: Scaffold + Core (Tuần 1-2)

```
Bước 1: Khởi tạo monorepo
  npm init -w packages/ui
  npm init -w packages/api
  npm init -w packages/types
  npm init -w packages/utils
  npm init -w apps/reader
  npm init -w apps/librarian
  npm init -w apps/admin

Bước 2: Cấu hình Vite + TypeScript
  - vite.config.ts (proxy /api → backend)
  - tsconfig paths: @yongin/* → packages/*/src

Bước 3: Xây dựng packages dùng chung
  - ui/src/components/layout/* → AppLayout, ReaderLayout, AuthLayout
  - ui/src/hooks/* → useAuth, useMediaQuery, useDebounce
  - ui/src/styles/theme.ts
  - api/src/client.ts + bookApi.ts, authApi.ts
  - utils/src/authStore.ts

Bước 4: Cổng Bạn đọc - Trang chủ
  - ReaderLayout (Header + Search + Content + Footer)
  - HomePage với NewestBooks + FeaturedCategories + NewsList
  - Tích hợp React Query
```

### Sprint 2: Reader Portal (Tuần 3)

```
Bước 5: Cổng Bạn đọc - Trang chi tiết
  - SearchResultsPage với SearchFilters + BookList + Pagination
  - BookDetailPage với tiện MARC21/Dublin Core
  - Auto-suggest search với debounce

Bước 6: Cổng Bạn đọc - Auth + Profile
  - LoginPage, RegisterPage
  - ProfilePage, CheckoutsPage, HistoryPage
  - WishlistPage, NotificationsPage
```

### Sprint 3: Thủ thư Portal (Tuần 4)

```
Bước 7: Cổng Thủ thư - Dashboard + Biên mục
  - AppLayout với Sidebar (responsive collapse)
  - DashboardPage (stats)
  - CatalogingPage (MarcRecordForm + tra trùng + sinh Cutter)
  - MarcRecordViewer (xem biểu ghi)

Bước 8: Cổng Thủ thư - Lưu thông + Kho
  - CirculationCheckout / Checkin
  - PatronSearchPage + PatronDetailPage
  - CollectionPage (chuyển kho, kiểm kê, thanh lý)
  - OverdueList, PrintingPage
```

### Sprint 4: Admin Portal (Tuần 5)

```
Bước 9: Cổng Quản trị
  - DashboardPage với biểu đồ (Recharts)
  - StaffManagementPage + RoleManagementPage
  - ReportsPage (tabs + filter date range)
  - SystemConfigPage (edit form)
  - StandardsPage (Cutter, Language, Shelves)
  - AuditLogPage
```

### Sprint 5: Hoàn thiện (Tuần 6)

```
Bước 10: Responsive testing + tối ưu
  - Test tất cả màn hình trên Mobile/Tablet/Desktop
  - Kiểm tra Ant Design responsive components
  - Tối ưu loading (Skeleton, lazy load images)
  - Error boundaries cho mỗi page

Bước 11: xoá code cũ
  - Xoá frontend/reader/public/index.html
  - Xoá frontend/librarian/public/index.html
  - Xoá frontend/admin/public/index.html
  - Cập nhật backend app.js serve React build
```

---

## 7. XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT

### Search không dấu & Unicode (giữ nguyên từ backend utils/vietnamese.js)

```typescript
// Frontend cũng cần normalize trước khi gửi lên API
export function normalizeSearch(str: string): string {
  const map: Record<string, string> = {
    'à': 'a','á': 'a','ả': 'a','ã': 'a','ạ': 'a',
    'ă': 'a','ắ': 'a','ằ': 'a','ẳ': 'a','ẵ': 'a','ặ': 'a',
    'â': 'a','ấ': 'a','ầ': 'a','ẩ': 'a','ẫ': 'a','ậ': 'a',
    'đ': 'd','Đ': 'D',
    // ... đầy đủ
  };
  return str.split('').map(ch => map[ch] || ch).join('').toLowerCase().trim();
}
```

### Notification Realtime (Supabase Realtime)

```typescript
// packages/api/src/realtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function subscribeNotifications(patronId: number, onNew: (n: any) => void) {
  return supabase
    .channel('notifications')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `patron_id=eq.${patronId}` },
      (payload) => onNew(payload.new)
    )
    .subscribe();
}
```

### Barcode Scanner (Cho mượn/trả)

```typescript
// packages/ui/src/hooks/useBarcodeScanner.ts
import { useEffect, useRef, useCallback } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const buffer = useRef('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Máy quét mã vạch gửi ký tự liên tục + Enter
      if (e.key === 'Enter') {
        if (buffer.current.length > 3) {
          onScan(buffer.current.trim());
          buffer.current = '';
        }
      } else if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onScan]);
}
```

---

## 8. TỔNG KẾT

| Hạng mục | Giá trị |
|----------|---------|
| **Tổng số component** | ~70 components (40 shared, 30 page-specific) |
| **Tổng số pages** | ~35 pages (12 reader + 12 librarian + 11 admin) |
| **Dòng code ước tính** | ~15,000-20,000 dòng TypeScript |
| **Thời gian** | 6 tuần (1.5 tháng) với 2 frontend devs |
| **Phụ thuộc** | Backend giữ nguyên, chỉ thay đổi cách serve static files |

**Kết quả:** Từ 3 file HTML vanilla JS → 3 React SPA chuyên nghiệp, responsive, có TypeScript, Ant Design, React Query, Zustand.
