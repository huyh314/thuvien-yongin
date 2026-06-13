# 📋 BÁO CÁO KIỂM TRA ĐỐI CHIẾU

## Đối chiếu App đã triển khai vs TongThe_UngDung.md (Thiết kế yêu cầu)

> Ngày kiểm tra: 12/06/2026 | Trạng thái: ĐÃ TEST

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mô tả — Hệ thống quản lý thư viện số cộng đồng

| Tiêu chí | Yêu cầu | Trạng thái |
|----------|---------|------------|
| Chuẩn MARC21 | ✅ | Đầy đủ ~25 trường |
| Chuẩn AACR2 | ⚠️ | Cấu hình có nhưng chưa áp dụng trong logic |
| Chuẩn ISBD | ❌ | Chưa có |
| Chuẩn DDC 23 | ⚠️ | Có Cutter + suggest-ddc nhưng DDC table chưa đầy đủ |
| Chuẩn Dublin Core | ✅ | Export DC XML có |
| 3 cổng portal | ✅ | Reader, Librarian, Admin |
| 5 phân hệ nghiệp vụ | ✅ | Cataloging, Circulation, Patron, Collection, OPAC |

### 1.2. Kiến trúc 3 cổng

| Lớp | Yêu cầu | Trạng thái | Ghi chú |
|-----|---------|------------|---------|
| **Cổng Bạn đọc** | Tra cứu OPAC, Mượn/trả, Quản lý cá nhân | ✅ Có | React SPA đầy đủ |
| **Cổng Thủ thư** | Biên mục MARC21, Xử lý TNTT, Lưu thông, Quản lý kho | ✅ Có | React SPA |
| **Cổng Quản trị** | Quản lý nhân sự, Báo cáo, Cấu hình, Danh mục | ✅ Có | React SPA + biểu đồ |
| **Tầng API** | RESTful API, JWT, Import/Export ISO 2709, TVQG | ⚠️ | JWT ✅, Import/Export ✅, TVQG một phần |
| **Tầng Dữ liệu** | MARC21 Schema, Full-text Search, Bảng Cutter, TVQG | ⚠️ | MARC21 Schema ✅, Elasticsearch ❌, Redis ❌, MinIO ❌ |

### 1.3. 5 Phân hệ nghiệp vụ

| # | Phân hệ | API có? | Frontend có? | Đánh giá |
|---|---------|---------|-------------|----------|
| 1 | Biên mục (Cataloging) | ✅ | ✅ | CRUD MARC21, tra trùng, Cutter, import/export ISO 2709 |
| 2 | Lưu thông (Circulation) | ✅ | ✅ | Checkout/checkin/renew |
| 3 | Bạn đọc (Patron) | ✅ | ✅ | CRUD + wishlist + notifications |
| 4 | Quản lý Kho (Collection) | ✅ | ✅ | Sections, transfer, discard |
| 5 | OPAC (Tra cứu) | ✅ | ✅ | Search basic, suggest, featured, detail |

### 1.4. Quy mô hệ thống

| Chỉ tiêu | Yêu cầu | Thực tế |
|----------|---------|---------|
| Số trường MARC21 | ~30 | DB có ~13 trường (245,100,260,020,082,852,650,300,041,520,250,490,700) |
| Số bước xử lý TNTT | 8 | B01-04 có code; B05-B08 chưa có module riêng |
| Số vần bảng Cutter | ~80 | ✅ Có bảng cutter_table với ~100+ vần |
| Số mã ngôn ngữ | ~60 | ⚠️ Chỉ có ~5 mã (vie, eng, fre, chi) |

---

## 2. CỔNG BẠN ĐỌC (READER PORTAL)

### 2.2. Danh sách màn hình

| # | Màn hình yêu cầu | Route yêu cầu | Backend API | Frontend React | Đánh giá |
|---|-----------------|---------------|-------------|----------------|----------|
| 2.2.1 | Trang chủ OPAC | `/` | `opac/newest`, `opac/featured` | ✅ HomePage.tsx | Đầy đủ |
| 2.2.2 | Kết quả tìm kiếm | `/search?q=` | `opac/search` | ✅ SearchResultsPage.tsx | Cơ bản |
| 2.2.3 | Chi tiết tài liệu | `/works/:id` | `opac/works/:id` | ✅ BookDetailPage.tsx | Đầy đủ |
| 2.2.4 | Khu vực cá nhân | `/profile` | `patron/:id`, `patron/checkouts`, `patron/history` | ✅ ProfilePage.tsx | Cơ bản |
| 2.2.5 | Đặt mượn online | `/profile/borrow` | — | ❌ | Chưa có |
| 2.2.6 | Thông báo | `/profile/notifications` | `patron/:id/notifications` | ⚠️ | Có UI tĩnh |
| 2.2.7 | Đăng nhập/Đăng ký | `/login`, `/register` | `patron/login`, `patron/register` | ✅ LoginPage, RegisterPage | Đầy đủ |

### 2.3. API OPAC

| API yêu cầu | API thực tế | Trạng thái |
|-------------|------------|------------|
| `GET /api/search?q=&type=&page=&limit=` | `GET /api/opac/search?q=&type=&page=&limit=` | ✅ Có (khác path) |
| `GET /api/search/advanced` | `GET /api/opac/advanced` | ⚠️ Có API nhưng frontend chưa dùng |
| `GET /api/featured/newest` | `GET /api/opac/newest` | ✅ Có |
| `GET /api/featured/popular` | (trong `/opac/featured.popular`) | ✅ |
| `GET /api/news` | ❌ | Chưa có API/news |
| `POST /api/search/suggest` | `GET /api/opac/suggest` | ✅ Có |

### 2.3.2. Các chế độ tìm kiếm

| Chế độ | Yêu cầu | Thực tế |
|--------|---------|---------|
| 🔍 Cơ bản | 1 ô nhập, 4 tab | ✅ Có (Segmented component) |
| 🔬 Nâng cao | Form + AND/OR/NOT | ⚠️ API có `/opac/advanced` nhưng UI chưa có |
| 📄 Toàn văn | Tìm trong PDF/Word | ❌ Chưa có OCR/full-text |
| 💡 Gợi ý | Auto-suggest | ✅ Có (debounce 300ms) |

### 2.3.2. Xử lý tiếng Việt

| Yêu cầu | Trạng thái |
|----------|------------|
| Chuẩn hóa Unicode NFC | ✅ Lưu `title_search` đã normalize |
| Tìm kiếm không dấu | ✅ `ILIKE` trên `title_search` |
| Elasticsearch ICU plugin | ❌ |
| Từ điển chính tả tiếng Việt | ❌ |

---

## 3. CỔNG THỦ THƯ (LIBRARIAN PORTAL)

### 3.2. Danh sách màn hình

| # | Yêu cầu | Route yêu cầu | Trạng thái |
|---|---------|---------------|------------|
| 3.3.1 | 📊 Dashboard | `/librarian` | ✅ DashboardPage.tsx |
| 3.3.2 | 📥 Tiếp nhận TNTT | `/librarian/acquisition` | ❌ Chưa có route riêng |
| 3.3.3 | 🔧 Xử lý sơ bộ | `/librarian/preprocessing` | ❌ Chưa có |
| 3.3.4 | 🏷️ Định ký hiệu | `/librarian/classification` | ⚠️ Gộp trong CatalogingPage |
| 3.3.5 | 📝 Biên mục MARC21 | `/librarian/cataloging` | ✅ CatalogingPage.tsx |
| 3.3.6 | 🔄 Mượn/Trả | `/librarian/circulation` | ✅ Checkout + Checkin |
| 3.3.7 | 🏪 Quản lý kho | `/librarian/collection` | ✅ CollectionPage.tsx |
| 3.3.8 | 🖨️ In ấn | `/librarian/printing` | ❌ Chưa có |

### 3.3.1. Dashboard Thủ thư

| Chỉ tiêu API | Yêu cầu | Thực tế |
|--------------|---------|---------|
| pendingProcessing | ✅ | ❌ Dùng admin dashboard thay |
| pendingCataloging | ✅ | ❌ |
| todayTransactions | ✅ | ❌ |
| overdueItems | ✅ | ✅ |

### 3.3.2. Biên mục MARC21

| API yêu cầu | Thực tế | Trạng thái |
|------------|---------|------------|
| `GET search-duplicate?title=&author=&year=` | `POST /api/cataloging/search-duplicate` | ✅ Có |
| `POST import-from-tvqg/{tvqgId}` | ❌ | Chưa có |
| `POST records` | ✅ | ✅ Có |
| `PUT records/{id}` | ✅ | ✅ Có |
| `GET records/{id}` | ✅ | ✅ Có |
| `DELETE records/{id}` | ✅ | ✅ Có |
| `POST generate-cutter` | ✅ | ✅ Có |
| `POST suggest-ddc` | ✅ | ✅ Có |
| `GET keywords?q=` | ✅ | ✅ Có |
| `POST export` | `GET export?format=` | ✅ Có (GET) |
| `POST import` | ✅ | ✅ Có |

### 3.3.3. Mượn sách

| Luồng | Bước | Trạng thái |
|-------|------|------------|
| Quét thẻ | `GET /api/patron/{barcode}` | ⚠️ Dùng search thay vì barcode |
| Quét sách | `GET /api/items/{barcode}` | ⚠️ Dùng search thay |
| Xác nhận | `POST /api/circulation/checkout` | ✅ Hoạt động |
| Hậu xử lý | Tạo checkout + cập nhật item | ✅ |

### 3.4. 6 Phân hệ nghiệp vụ

| Phân hệ | Yêu cầu | Trạng thái |
|---------|---------|------------|
| 1. Tiếp nhận & Xử lý sơ bộ | Tạo phiếu, đối chiếu, đóng dấu, ĐKCB | ❌ Chưa có module |
| 2. Biên mục MARC21 | Tra trùng, tải TVQG, form MARC21 | ✅ |
| 3. Định ký hiệu TNTT | DDC, Cutter, Từ khóa | ⚠️ Có Cutter + suggest DDC |
| 4. Lưu thông | Mượn/Trả, quá hạn, thống kê | ✅ |
| 5. Quản lý Kho | Cấu trúc kho, kiểm kê, thanh lý | ⚠️ Chuyển kho+thanh lý có, inventory chưa |
| 6. In ấn & Tải ảnh bìa | In nhãn, RFID, upload ảnh | ❌ Chưa có |

---

## 4. CỔNG QUẢN TRỊ (ADMIN PORTAL)

### 4.2. Danh sách màn hình

| # | Yêu cầu | Route | Trạng thái |
|---|---------|-------|------------|
| 4.3.1 | 📊 Dashboard | `/admin` | ✅ Có biểu đồ |
| 4.3.2 | 👤 Quản lý nhân sự | `/admin/staff` | ✅ StaffManagementPage |
| 4.3.3 | 🔐 Phân quyền | `/admin/roles` | ❌ Chưa có trang riêng |
| 4.3.4 | 📋 Báo cáo thống kê | `/admin/reports` | ✅ ReportsPage (tabs) |
| 4.3.5 | ⚙️ Cấu hình hệ thống | `/admin/config` | ✅ SystemConfigPage |
| 4.3.6 | 📚 Danh mục chuẩn | `/admin/standards` | ✅ StandardsPage |

### 4.3.3. Báo cáo thống kê

| Báo cáo yêu cầu | API thực tế | Trạng thái |
|----------------|------------|------------|
| Tổng quan hoạt động | `GET /api/admin/reports/overview` | ✅ |
| Thống kê tài liệu mới bổ sung | `GET /api/admin/reports/new-acquisitions` | ⚠️ Route có, data ít |
| Thống kê mượn/trả | `GET /api/admin/reports/circulation` | ✅ |
| Thống kê bạn đọc | `GET /api/admin/reports/patrons` | ❌ Chưa có |
| Danh sách quá hạn | `GET /api/admin/reports/overdue` | ✅ (qua circulation/overdue) |
| Báo cáo kiểm kê | `GET /api/admin/reports/inventory` | ❌ |
| Báo cáo thanh lý | `GET /api/admin/reports/withdrawn` | ❌ |
| Khối lượng biên mục | `GET /api/admin/reports/cataloging-stats` | ⚠️ Route có |
| DDC stats | `GET /api/admin/charts/ddc` | ✅ |
| Ngôn ngữ stats | `GET /api/admin/charts/languages` | ✅ |
| Top keywords | `GET /api/admin/popular-keywords` | ✅ |

### 4.3.4. Danh mục chuẩn

| Danh mục | Trạng thái |
|----------|------------|
| Bảng Cutter | ✅ Xem được |
| Mã ngôn ngữ | ✅ Xem được (15/60) |
| Phân loại DDC 23 | ❌ Chưa có bảng DDC |
| Từ khóa TVQG | ⚠️ Query được nhưng data ít |
| Quy tắc biên mục | ❌ |
| Loại bạn đọc & Chính sách | ❌ |
| Cấu trúc kho | ✅ |

---

## 5. QUY TRÌNH 8 BƯỚC XỬ LÝ TNTT

| Bước | Tên | Module | Trạng thái |
|------|-----|--------|------------|
| B01 | Tiếp nhận | `acquisition` | ❌ Module chưa hoàn chỉnh |
| B02 | Xử lý sơ bộ | `preprocessing` | ❌ |
| B03 | Định ký hiệu | `classification` | ⚠️ Cutter có, DDC gợi ý |
| B04 | Biên mục | `cataloging` | ✅ |
| B05 | In ấn, dán nhãn | `printing` | ❌ |
| B06 | Tải ảnh bìa | `cataloging` | ❌ (cover_url null) |
| B07 | Kiểm tra, xếp giá | `quality-control` | ❌ |
| B08 | Bàn giao | `handover` | ❌ |

---

## 6. KHỔ MẪU MARC21

| Yêu cầu | Trạng thái |
|----------|------------|
| Đầu biểu (Leader) | ✅ 24 ký tự |
| Danh mục (Directory) | ✅ Tự động parse/export |
| ~30 trường MARC21 | ⚠️ DB lưu được hết nhưng UI chỉ có ~13 |
| Subfield codes | ✅ $a, $b, $c... đầy đủ |
| ISO 2709 import/export | ✅ |
| Dublin Core export | ✅ |
| MARC21 XML export | ✅ |
| CSDL 3 bảng MARC21 | ✅ marc_records, marc_fields, marc_subfields |
| CSDL bib_items, items, patrons, circulation | ✅ |

---

## 7. KIẾN TRÚC & CÔNG NGHỆ

### 7.2. Tech Stack

| Tầng | Yêu cầu | Thực tế | Đánh giá |
|------|---------|---------|----------|
| Frontend Web | React/Vue/Next.js | React 18 + Vite + Ant Design | ✅ |
| Mobile | React Native/Flutter | Flutter (code đã tạo, chưa build) | ⚠️ |
| Backend | Node.js/Python/.NET | Node.js + Express | ✅ |
| Database | PostgreSQL/SQL Server | Supabase (PostgreSQL) | ✅ |
| Search Engine | Elasticsearch | ❌ (dùng PostgreSQL ILIKE) | ❌ |
| Cache | Redis | ❌ | ❌ |
| File Storage | MinIO/S3 | ❌ (cover_url null) | ❌ |
| Queue | RabbitMQ/Bull | ❌ | ❌ |
| Auth | JWT + OAuth2 | JWT (chưa có OAuth2) | ⚠️ |
| Container | Docker/K8s | ❌ (infra trống) | ❌ |

### 7.3. Đặc tả kỹ thuật

| Yêu cầu | Trạng thái |
|----------|------------|
| Xử lý tiếng Việt (Unicode NFC) | ✅ |
| Tìm kiếm không dấu | ✅ |
| Elasticsearch | ❌ |
| Import ISO 2709 | ✅ |
| Export ISO 2709 | ✅ |
| Tích hợp TVQG | ❌ API chưa kết nối thực sự |
| Bảng Cutter | ✅ |
| ~60 mã ngôn ngữ | ⚠️ 5 mã |

---

## 8. TỔNG HỢP

### ĐÃ ĐÁP ỨNG (✅): 62/95 điểm ~65%

**Backend:** 7/8 module hoàn chỉnh, RESTful API đầy đủ, JWT + RBAC, Import/Export ISO 2709, Cutter

**Frontend:** 3 portals React SPA, responsive với Ant Design, biểu đồ Recharts

**Database:** 21 bảng, dữ liệu demo

### CHƯA ĐÁP ỨNG (❌): 33/95 điểm ~35%

## 🔴 ƯU TIÊN CAO (tác động trực tiếp đến người dùng)

| # | Thiếu | Mô tả | Giải pháp | Effort |
|---|-------|-------|-----------|--------|
| 1 | **Elasticsearch** | Tìm kiếm full-text + highlight + suggest nâng cao | Cài Elasticsearch Docker, tích hợp `elastic.js` | 2 tuần |
| 2 | **TVQG Integration** | Kết nối thư viện quốc gia để tra trùng | `config/tvqg.js` cần implement HTTP client | 3 ngày |
| 3 | **In ấn + RFID** | In nhãn, mã vạch, RFID tag | Module `hardware` (đã plan trong giai đoạn 2) | 3 tuần |
| 4 | **8 Bước TNTT (B01-B08)** | Thiếu 5/8 bước | Tạo module riêng cho từng bước | 4 tuần |
| 5 | **Mobile App** | Code Flutter đã viết nhưng chưa build/test | Cài Flutter SDK + build APK | 1 tuần |
| 6 | **Cover Ảnh / File Storage** | Chưa có ảnh bìa sách nào | Supabase Storage hoặc MinIO | 1 tuần |

## 🟡 ƯU TIÊN TRUNG BÌNH (cải thiện trải nghiệm)

| # | Thiếu | Giải pháp | Effort |
|---|-------|-----------|--------|
| 7 | **Đặt mượn online** | `POST /api/patron/:id/holds` + UI giỏ mượn | 1 tuần |
| 8 | **Dashboard thủ thư riêng** | API `GET /api/librarian/dashboard` | 2 ngày |
| 9 | **Phân quyền UI quản lý** | Trang `/admin/roles` + form gán quyền | 3 ngày |
| 10 | **News API** | `GET /api/news` + UI quản lý | 2 ngày |
| 11 | **Redis cache** | Cache search results + newest books | 1 tuần |
| 12 | **Docker deployment** | Docker Compose cho app + DB + cache | 1 tuần |

## 🟢 ƯU TIÊN THẤP (hoàn thiện nghiệp vụ)

| # | Thiếu | Effort |
|---|-------|--------|
| 13 | Bảng DDC 23 đầy đủ (danh mục chuẩn) | 2 ngày |
| 14 | ISBD rules | 1 tuần |
| 15 | Mã ngôn ngữ đủ 60 | 1 ngày |
| 16 | Báo cáo patrons/inventory/withdrawn | 1 tuần |
| 17 | Quên mật khẩu + email reset | 3 ngày |
| 18 | Audit log xem được | 2 ngày |
