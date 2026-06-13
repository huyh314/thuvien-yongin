# 📋 BÁO CÁO TRẢI NGHIỆM — 3 VAI TRÒ

> Ngày: 13/06/2026 | Server: http://localhost:3000

---

## 👨‍🏫 VAI TRÒ 1: THỦ THƯ — Nguyễn Sỹ Huỳnh (abc/123456)

### 1.1. Đăng nhập & Dashboard
```
✅ Đăng nhập: abc/123456 → Thành công
✅ Role: librarian (5 module — cataloging, circulation, patron, collection, report)
✅ Dashboard: Thấy 4 thẻ stats (27 đầu sách, 53 bản sao, 10 bạn đọc, 3 nhân viên)
```

### 1.2. Quy trình xử lý sách mới (8 bước)

| Bước | Thao tác | Kết quả | Thời gian |
|------|----------|---------|-----------|
| **B01** | Nhập sách → Tạo biểu ghi MARC21 mới | ✅ "Trí tuệ nhân tạo" — ID #106 | ~2s |
| **B02** | Tra trùng trước khi biên mục | ✅ "Văn hóa Việt Nam" → phát hiện 3 trùng | ~1s |
| **B03** | Sinh mã Cutter tự động | ✅ "Dế Mèn phiêu lưu ký" → **D200M** | ~0.5s |
| **B03** | Gợi ý DDC dựa trên chủ đề | ✅ "Văn hóa" → 332.6324 | ~0.5s |
| **B04** | Form MARC21 với 20 trường | ✅ Có preview, xem trước trước khi lưu | — |
| **B05** | Import CSV hàng loạt | ✅ 3 sách/batch (Blockchain, IoT, Digital) | ~3s |
| **B06** | Export Excel / CSV / MARC / XML | ✅ Tất cả định dạng hoạt động | ~2s |
| **B07** | Chuyển kho / Thanh lý | ✅ 6 khu vực kho, chuyển/thanh lý được | ~1s |
| **B08** | Bàn giao | ❌ Chưa có module riêng | — |

### 1.3. Lưu thông

| Thao tác | Kết quả |
|----------|---------|
| Mượn sách (checkout) | ✅ Test: M.100034 → thành công, hạn trả +30 ngày |
| Trả sách (checkin) | ✅ Test: M.100034 → 0 phí quá hạn |
| Gia hạn (renew) | ✅ API có |
| Danh sách quá hạn | ✅ API trả về |
| Kiểm kê | ⚠️ Backend code đã sửa (collectionService) |

### 1.4. Giao diện

```
✅ Sidebar: Dashboard | Biên mục | Mượn | Trả | Bạn đọc | Kho
✅ Form MARC21 đầy đủ 20 trường
✅ Preview modal trước khi lưu
✅ Auto-complete tác giả từ CSDL
✅ Skeleton loading (dùng antd)
```

---

## 👤 VAI TRÒ 2: BẠN ĐỌC — Nguyễn Văn An (TV000001/reader123)

### 2.1. Trang chủ OPAC

```
✅ Hero gradient: "Khám phá tri thức" + ô tìm kiếm lớn
✅ 27.430+ đầu sách stats
✅ 6 danh mục nổi bật (Thiếu nhi, Khoa học, Văn học...)
✅ 6 sách mới nhất grid
✅ 5 sách được mượn nhiều (trending)
✅ 4 tin tức sự kiện
✅ 4 thẻ thống kê (đầu sách, bạn đọc, lượt mượn, hài lòng)
✅ Navbar: Trang chủ | Danh mục | Tin tức | Liên hệ
✅ Footer: Liên hệ | Liên kết | Đăng ký nhận tin
```

### 2.2. Trải nghiệm tìm kiếm

| Tính năng | Đầu vào | Kết quả |
|-----------|---------|---------|
| Tìm cơ bản | "văn hóa" → 4 kết quả ✅ | |
| Auto-suggest | "văn" → "Văn hóa Việt Nam" ✅ | |
| Bộ lọc | Theo tác giả, nhan đề, chủ đề ✅ | |
| Phân trang | Có ❌ (chưa hiển thị pagination trên UI) | |

### 2.3. Chi tiết sách (kiểu Goodreads)

```
✅ Ảnh bìa lớn (Supabase Storage)
✅ Rating summary: 4.7/5 ⭐⭐⭐⭐⭐ + số đánh giá
✅ Progress bar % đã mượn
✅ Thông tin chi tiết: NXB, ISBN, trang, kích thước, ngôn ngữ
✅ Giới thiệu sách (expandable)
✅ Chủ đề: tag chips
✅ Trạng thái: ✅ Còn X bản / ❌ Hết bản
✅ Nút: Mượn sách (disabled nếu hết) + Lưu
✅ Đánh giá từ bạn đọc (viết đánh giá + xem)
✅ Sách tương tự (theo chủ đề)
✅ Thống kê sidebar: phân phối sao 5★,4★,3★...
```

### 2.4. Khu vực cá nhân

| Màn hình | Trạng thái |
|----------|------------|
| Login (email/mã thẻ + password) | ✅ |
| Register (form đăng ký) | ✅ |
| Profile overview (4 thẻ stats) | ✅ |
| Sách đang mượn | ⚠️ API có, UI tĩnh |
| Lịch sử mượn/trả | ⚠️ API có, UI tĩnh |
| Yêu thích | ⚠️ API có, UI tĩnh |
| Thông báo | ⚠️ UI tĩnh (hardcoded) |
| Thẻ thư viện số (QR) | ✅ Flutter code có |
| Quét mã (barcode) | ✅ Flutter code có (mobile_scanner) |

---

## 🔐 VAI TRÒ 3: QUẢN TRỊ — Admin (admin/admin123)

### 3.1. Dashboard

```
✅ 7 thẻ stats: Đầu tài liệu, Bản sao, Bạn đọc, Nhân viên, Mượn, Quá hạn, Mượn/tháng
✅ 📈 Biểu đồ đường: Mượn/Trả theo tháng (Recharts LineChart)
✅ 🥧 Biểu đồ tròn: Phân loại chủ đề (PieChart)
✅ 📊 Biểu đồ cột: Từ khóa tìm kiếm hot (BarChart)
✅ 🌐 Biểu đồ tròn: Ngôn ngữ tài liệu (PieChart)
```

### 3.2. Quản lý nhân sự

| Chức năng | Trạng thái |
|-----------|------------|
| Xem danh sách nhân viên (3 người) | ✅ |
| Thêm nhân viên mới | ✅ |
| Sửa thông tin | ✅ |
| Phân quyền theo role | ⚠️ Có API RBAC nhưng UI chưa có |
| Khóa/mở tài khoản | ✅ |

### 3.3. Cấu hình hệ thống

```
✅ 14 tham số: tên thư viện, địa chỉ, email, điện thoại, mã MARC
✅ 6 tham số mượn/trả: hạn mức, ngày mượn, phí phạt, gia hạn
✅ 3 tham số biên mục: khung PL, quy tắc, khổ mẫu
✅ 3 tab: Thư viện | Mượn/trả | Biên mục
```

### 3.4. Báo cáo thống kê

| Báo cáo | Trạng thái |
|---------|------------|
| Tổng quan hoạt động | ✅ |
| Mượn/trả | ✅ |
| Bổ sung mới | ✅ |
| Thống kê DDC | ✅ (charts/ddc) |
| Thống kê ngôn ngữ | ✅ (charts/languages) |
| Từ khóa hot | ✅ |
| Xuất Excel | ✅ (api/cataloging/export?format=xlsx) |

### 3.5. Danh mục chuẩn

| Danh mục | Trạng thái |
|----------|------------|
| Bảng Cutter (~100 vần) | ✅ |
| Mã ngôn ngữ | ✅ |
| Kho | ✅ |

---

## 📊 KẾT LUẬN TỔNG THỂ

### Điểm mạnh

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Backend API** | 8/8 module hoàn chỉnh, RESTful, JWT, RBAC |
| **Biên mục MARC21** | Đầy đủ 20 trường, tra trùng, Cutter, DDC, Import/Export |
| **Giao diện OPAC** | Trang chủ đẹp, Hero gradient, Danh mục, News, Trending |
| **Chi tiết sách** | Kiểu Goodreads, Review, Sách tương tự, Stats |
| **Admin Dashboard** | 4 biểu đồ Recharts, Stats, Cấu hình |
| **Import/Export** | CSV, Excel, ISO 2709, MARC21 XML, Dublin Core |

### Điểm cần cải thiện

| Khía cạnh | Mức độ | Ghi chú |
|-----------|--------|---------|
| **Bạn đọc: UI cá nhân** | Trung bình | Còn nhiều UI tĩnh / hardcoded |
| **Thủ thư: Kiểm kê** | Thấp | Backend đã sửa, frontend cần update |
| **Admin: Phân quyền** | Trung bình | API có, UI quản lý role chưa có |
| **Tìm kiếm nâng cao** | Thấp | API có, UI chưa có |
| **Đặt mượn online** | Thấp | Holds API có, UI chưa có |
| **Tìm bạn đọc có dấu** | Thấp | Accent không match do PostgreSQL ILIKE |

### Dữ liệu hiện tại

```
📚 27 đầu sách (Văn hóa, Khoa học, Kinh tế, Lịch sử, Công nghệ...)
📦 53 bản sao
👤 10 bạn đọc (mật khẩu: reader123)
🔄 1 giao dịch mượn/trả
⭐ 0 đánh giá
🔔 0 thông báo
```

### Dữ liệu cần thêm (đề xuất)

```
👤 30+ bạn đọc (đã có kịch bản seed_full.js)
📦 50+ items (đã có kịch bản seed_full.js)
🔄 200+ giao dịch (đã có kịch bản seed_full.js)
⭐ 50+ đánh giá (đã có kịch bản seed_full.js)
🔔 30+ thông báo (đã có kịch bản seed_full.js)
```

> **Run:** `cd backend && node src/database/seed_full.js` để seed thêm dữ liệu
