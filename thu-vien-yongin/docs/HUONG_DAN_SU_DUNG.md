# 📘 HƯỚNG DẪN SỬ DỤNG — PHẦN MỀM THƯ VIỆN YONGIN

> Server: http://localhost:3000 (đang chạy)

---

## 🚀 TRUY CẬP NHANH

| Cổng | URL | Đăng nhập |
|------|-----|-----------|
| 👤 **Bạn đọc** (OPAC) | `http://localhost:3000/` | Không cần |
| 🧑‍🏫 **Thủ thư** | `http://localhost:3000/librarian/` | Cần token |
| 🔐 **Quản trị** | `http://localhost:3000/admin/` | Cần token |

### Tài khoản

| Vai trò | Username | Password | Ghi chú |
|---------|----------|----------|---------|
| **Quản trị viên** | `admin` | `admin123` | Toàn quyền hệ thống |
| **Thủ thư 1** | `librarian` | `lib123` | Biên mục, lưu thông, kho |
| **Thủ thư 2** | `abc` | `123456` | Biên mục, lưu thông |
| **Bạn đọc 1** | `TV000001` | `reader123` | Nguyễn Văn An |
| **Bạn đọc 2** | `TV000002` | `reader123` | Trần Thị Bình |
| ... | `TV000003-10` | `reader123` | 10 bạn đọc |

---

## 1. 👤 CỔNG BẠN ĐỌC (http://localhost:3000/)

> Dành cho: Người dân, học sinh, sinh viên — **Không cần đăng nhập** để tra cứu

### 1.1. Trang chủ

```
┌──────────────────────────────────────────────┐
│ Navbar: 🏛️ Yongin | Trang chủ | DMục | T.Tức | L.Hệ | 🔍 | Đăng nhập │
├──────────────────────────────────────────────┤
│ 📚 KHÁM PHÁ TRI THỨC                         │
│ 27.000+ đầu sách đang chờ bạn                │
│ ┌──────────────────────────────────┐         │
│ │ 🔍 Nhập tên sách, tác giả... [Tìm]│         │ ← Search hero
│ └──────────────────────────────────┘         │
│ 🔥 Văn hóa · Lịch sử · Khoa học · Thiếu nhi│
│ 27.430 sách · 3.245 bạn đọc · 98% hài lòng  │
├──────────────────────────────────────────────┤
│ 📂 Danh mục [🧒🔬📖💻💰📜]                  │ ← Click → tìm theo chủ đề
├──────────────────────────────────────────────┤
│ 📰 Tin tức & Sự kiện                         │ ← Sự kiện thư viện
├──────────────────────────────────────────────┤
│ ⭐ Sách mới nhập [6 cuốn grid]               │ ← Click → xem chi tiết
├──────────────────────────────────────────────┤
│ 🔥 Đang được mượn nhiều [top 5]             │ ← Trend books
├──────────────────────────────────────────────┤
│ 📊 Thư viện qua số liệu                      │
└──────────────────────────────────────────────┘
```

**Thao tác:**
- **Gõ ô tìm kiếm** → gợi ý tự động sau 300ms → Enter để search
- **Click danh mục** → lọc sách theo chủ đề
- **Click sách mới** → xem chi tiết
- **Click Đăng nhập (phải)** → đăng nhập/đăng ký

### 1.2. Tìm kiếm

```
┌──────────────────────────────────────────────┐
│ 🔍 [Tìm kiếm...█]            [📖 TB] [✍️TG]  │ ← 4 loại: TB/TG/ND/CĐ
├──────────────────────────────────────────────┤
│ 💡 Gợi ý: "Văn hóa Việt Nam"                │
│                                              │
│ 📖 Văn hóa Việt Nam     ⭐ 4.5 · ✅ 3 bản   │ ← BookCard dọc
│ Trần Quốc Vượng · 2023                      │
│ ────────────────────────────────────         │
│ 📖 Cơ sở văn hóa VN      ⭐ 4.2 · ✅ 2 bản  │
│ Trần Ngọc Thêm · 2022                       │
│                                              │
│ ◀ 1 2 3 ... 15 ▶                             │ ← Pagination
└──────────────────────────────────────────────┘
```

**Thao tác:**
- Gõ từ khóa → Enter
- Chọn tab: Toàn bộ / Tác giả / Nhan đề / Chủ đề
- Click sách → xem chi tiết
- Scroll xuống → infinite scroll tự động load thêm

### 1.3. Chi tiết sách

```
┌──────────────────────────────────────────────┐
│ ◀ Quay lại                  [❤️] [📤]       │
├──────────────────────────────────────────────┤
│ ┌────────┐  📖 VĂN HÓA VIỆT NAM             │
│ │ ẢNH   │  ✍️ Trần Quốc Vượng               │
│ │ BÌA   │  ─── 4.7 ⭐⭐⭐⭐⭐                  │
│ │ (LỚN) │  23 đánh giá · 3 bản              │
│ │       │                                    │
│ │[❤️][📤]│  ✅ Còn 3 bản ████████░░ 80%     │
│ └────────┘                                    │
│           [📖 MƯỢN SÁCH]  [❤️ LƯU]          │
│                                              │
│  NXB: Văn hóa  ·  2023  ·  ISBN...  · 456 tr│
│  📝 Giới thiệu: [Xem thêm ▾]                │
│  🏷️ Văn hóa · Lịch sử · Việt Nam            │
│ ═════════════════════════════════════════    │
│ ⭐ ĐÁNH GIÁ (23)                             │
│ [Viết đánh giá ⭐⭐⭐⭐⭐]                      │
│ 👤 Admin ★★★★★ "Sách rất hay!" 12/06        │
│ ═════════════════════════════════════════    │
│ 📚 SÁCH TƯƠNG TỰ ← 4 cuốn theo chủ đề       │
└──────────────────────────────────────────────┘
```

**Thao tác:**
- Click **Mượn sách** → (cần đăng nhập) → đặt mượn
- Click **Lưu (❤️)** → thêm vào yêu thích
- Click **Viết đánh giá** → chọn sao + viết comment → Gửi
- Scroll xuống → xem sách tương tự

### 1.4. Đăng nhập & Cá nhân

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ 🔐 ĐĂNG NHẬP               │  │ 👤 XIN CHÀO, NGUYỄN VĂN AN!   │
│                             │  ├──────────────────────────────┤
│ Email / Mã thẻ [TV000001  ]│  │ 📚 2 │ ⏰ 0 │ ✅ 12 │ ❤️ 5 │
│ Mật khẩu    [********  ]   │  ├──────────────────────────────┤
│                             │  │ 📚 Sách đang mượn             │
│ [ĐĂNG NHẬP]                │  │ 📋 Lịch sử mượn/trả            │
│                             │  │ ❤️ Sách yêu thích              │
│ Chưa có TK? [Đăng ký]      │  │ 🔔 Thông báo                   │
└──────────────────────────────┘  │ 🆔 Thẻ thư viện số            │
                                  │ 🚪 Đăng xuất                  │
                                  └──────────────────────────────┘
```

---

## 2. 🧑‍🏫 CỔNG THỦ THƯ (http://localhost:3000/librarian)

> Dành cho: Cán bộ thư viện — **Cần đăng nhập** (librarian/lib123 hoặc abc/123456)

### 2.1. Đăng nhập & Dashboard

```
┌──────────────────────────────────────────────┐
│ 🔐 Đăng nhập Thủ thư                         │
│ Username: [librarian  ]                      │
│ Password: [********   ]                      │
│ [ĐĂNG NHẬP]                                  │
│ 👑 admin/admin123 · 🧑‍🏫 librarian/lib123     │
└──────────────────────────────────────────────┘

→ Sau login:
┌────┬─────────────────────────────────────────┐
│  🏛️│ 📊 Thủ thư            👤 Thủ thư       │
│ Y  │ ┌─────┐┌─────┐┌────┐┌─────┐           │
│ o  │ │📚27 ││👤10 ││🔄0 ││⚠️0  │           │
│ n  │ │Sách ││Bạn  ││Mượn││Quá  │           │
│ g  │ │     ││đọc  ││    ││hạn  │           │
│ i  │ └─────┘└─────┘└────┘└─────┘           │
│ n  │ ⏰ Danh sách quá hạn (nếu có)           │
│    └─────────────────────────────────────────┘
└────┘
```

### 2.2. Biên mục MARC21

```
Quy trình: Tra trùng → Nhập thông tin → Preview → Lưu

┌──────────────────────────────────────────────┐
│ 📝 BIÊN MỤC MARC21      [🔍 Tra trùng][👁️ Xem trước] │
├──────────────────────────────────────────────┤
│ 📕 Nhan đề *     [Văn hóa Việt Nam   ]       │
│ ✍️ Tác giả       [Trần Quốc Vượng ⚡]       │   ← ⚡ = sinh Cutter
│                                              │
│ ✂️ Cutter: V105H                               │   ← kết quả Cutter
│                                              │
│ NXB [Văn hóa]  Năm [2023]  ISBN [978...]     │
│ DDC [332.6324] Chủ đề [Văn hóa]  ĐKCB* [... ]│
│ Kho [Kho Mượn ▼]  Lần XB [Tái bản 5]         │
│ Tùng thư [...]  ND song ngữ [...]             │
│ Số trang [456]  Khổ [24 cm]                   │
│ Tổ chức [...]  Địa danh [...]                  │
│ TG phụ [▼ chọn từ CSDL]                       │
│                                              │
│ 💾 LƯU BIỂU GHI MARC21                        │
└──────────────────────────────────────────────┘
```

**Các bước:**
1. Nhập **Nhan đề** → Click **Tra trùng** (kiểm tra sách đã có chưa)
2. Nhập **Tác giả** → Click **⚡** → tự động sinh Cutter
3. Nhập các thông tin còn lại (NXB, ISBN, DDC, Chủ đề, ĐKCB...)
4. Click **👁️ Xem trước** → kiểm tra MARC21
5. Click **💾 Lưu** → tạo biểu ghi thành công

### 2.3. Mượn/Trả sách

```
┌──────────────────────┐ ┌──────────────────────┐
│ 📤 MƯỢN SÁCH         │ │ 📥 TRẢ SÁCH         │
├──────────────────────┤ ├──────────────────────┤
│ Quét thẻ: [TV000001] │ │ Quét sách: [M.102568]│
│ 👤 Nguyễn Văn An     │ │ 🟠 M.102568          │
│ Hạn mức: 5 cuốn     │ │ [✅ XÁC NHẬN TRẢ]   │
│ 📚 Đang mượn: 2/5   │ │                      │
│ ───────────────────  │ │ ✅ M.102568 → Đúng hạn│
│ Quét sách: [M.102568]│ │                      │
│ ✅ Văn hóa Việt Nam  │ │                      │
│ [✅ XÁC NHẬN MƯỢN]  │ │                      │
└──────────────────────┘ └──────────────────────┘
```

### 2.4. Quản lý kho

```
┌──────────────────────────────────────────────┐
│ 📦 Tồn kho | 🏪 Chuyển kho | 🗑️ Thanh lý    │
├──────────────────────────────────────────────┤
│ ĐKCB      | Tên sách           | Kho   | T.thái│
│ M.102568  | Văn hóa Việt Nam   | KMượn | ✅  │
│ M.102569  | Cơ sở VH VN        | KĐọc  | ✅  │
│ ...                                          │
└──────────────────────────────────────────────┘
```

---

## 3. 🔐 CỔNG QUẢN TRỊ (http://localhost:3000/admin)

> Dành cho: Quản trị viên — **Cần đăng nhập** (admin/admin123)

### 3.1. Dashboard

```
┌────┬─────────────────────────────────────────┐
│  🏛️│ 🏛️ QUẢN TRỊ            👤 Quản trị viên│
│ A  │ ┌──────┐┌──────┐┌──────┐┌──────┐      │
│ d  │ │📚 27 ││👤 10 ││🔄 1  ││⚠️ 0  │      │
│ m  │ └──────┘└──────┘└──────┘└──────┘      │
│ i  │ ┌──────────────┬──────────────────┐    │
│ n  │ │ 📈 Mượn/tháng │ 🥧 Chủ đề       │    │ ← Biểu đồ
│    │ │ LineChart    │ PieChart        │    │
│    │ ├──────────────┼──────────────────┤    │
│    │ │ 🔥 Keywords  │ 🌐 Ngôn ngữ     │    │ ← Biểu đồ
│    │ │ BarChart     │ PieChart        │    │
│    │ └──────────────┴──────────────────┘    │
│    └─────────────────────────────────────────┘
└────┘
```

### 3.2. Nhân sự

```
👤 QUẢN LÝ NHÂN SỰ                   [+ Thêm]
┌──────┬──────────┬────────┬──────────┐
│ Tên  | Username | Vai trò| Trạng thái│
├──────┼──────────┼────────┼──────────┤
│ QTV  | admin    | admin  | 🟢 HĐ   │ ← Click để sửa
│ TT   | librarian| lib    | 🟢 HĐ   │
└──────┴──────────┴────────┴──────────┘
```

### 3.3. Cấu hình

```
📁 THƯ VIỆN | 💡 MƯỢN/TRẢ | 📚 BIÊN MỤC
┌──────────────────────────────────────────┐
│ Tên: Thư viện số cộng đồng Yongin       │
│ Địa chỉ: 46 Bạch Đằng, Hải Châu, ĐN     │
│ Số sách mượn tối đa: [5]                 │
│ Số ngày mượn: [30]                       │
│ Phí phạt/ngày: [5000]                    │
│ [💾 LƯU]                                  │
└──────────────────────────────────────────┘
```

---

## 4. API (cho nhà phát triển)

### Public APIs (không cần auth)

```
GET  /api/opac/search?q=keyword&type=all
GET  /api/opac/newest?limit=12
GET  /api/opac/works/:id
GET  /api/opac/suggest?q=keyword
GET  /api/opac/featured
GET  /api/opac/advanced?title=&author=&...
GET  /api/health
```

### Auth APIs (cần token)

```
POST /api/auth/login           Body: { username, password }
POST /api/cataloging/records   Body: { fields: { "245": [...] } }
POST /api/circulation/checkout Body: { patronBarcode, itemBarcodes }
POST /api/cataloging/import    Multipart: file + format
GET  /api/cataloging/export?format=csv
GET  /api/admin/dashboard
```

---

## 5. DỮ LIỆU DEMO

### Sách tiêu biểu

| Tên sách | Tác giả | Năm | ISBN | ĐKCB |
|----------|---------|-----|------|------|
| Văn hóa Việt Nam | Trần Quốc Vượng | 2023 | 9786047767298 | M.102568 |
| Lịch sử Việt Nam | Phan Huy Lê | 2021 | 9786047723456 | M.100020 |
| Dế Mèn phiêu lưu ký | Tô Hoài | 2023 | 9786047823456 | M.100040 |
| Nhà giả kim | Paulo Coelho | 2022 | 9786047856789 | M.100050 |
| Đắc nhân tâm | Dale Carnegie | 2022 | 9786047878901 | M.100055 |
| Hạt giống tâm hồn | Nhiều tác giả | 2023 | 9786047867890 | M.100060 |

### Bạn đọc

| Mã thẻ | Họ tên | Pass |
|--------|--------|------|
| TV000001 | Nguyễn Văn An | reader123 |
| TV000002 | Trần Thị Bình | reader123 |
| TV000003 | Lê Văn Chí | reader123 |
| TV000004 | Phạm Thị Dung | reader123 |
| TV000005 | Hoàng Văn Em | reader123 |

---

> 📍 **Server:** http://localhost:3000  
> 📧 **Email hỗ trợ:** info@thuvienyongin.vn  
> 📄 **Tài liệu thiết kế:** `docs/TongThe_UngDung.md`
