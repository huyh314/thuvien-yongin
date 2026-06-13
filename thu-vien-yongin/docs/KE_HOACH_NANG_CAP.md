# 🚀 KẾ HOẠCH NÂNG CẤP PHẦN MỀM THƯ VIỆN YONGIN

> Phiên bản: 1.0 | Ngày: 12/06/2026 | Dựa trên so sánh với Koha, Evergreen, FOLIO

---

## 📐 CHIẾN LƯỢC TỔNG THỂ

**3 giai đoạn, 12 tính năng, 6 tháng**

```
GIAI ĐOẠN 1 (1-2 tháng):    Cốt lõi hoàn thiện  →  4 tính năng
GIAI ĐOẠN 2 (2-3 tháng):    Mở rộng nghiệp vụ   →  5 tính năng
GIAI ĐOẠN 3 (3-6 tháng):    Hệ sinh thái         →  3 tính năng
```

---

## 🟢 GIAI ĐOẠN 1: HOÀN THIỆN MVP (Tháng 1-2)

### 1. RESPONSIVE UI VỚI REACT/VUE

**Target:** Thay thế 3 file HTML vanilla JS bằng React 18 + Ant Design

**Cấu trúc thư mục mới:**
```
frontend/
├── reader/          # React app → Cổng Bạn đọc (OPAC)
├── librarian/       # React app → Cổng Thủ thư
├── admin/           # React app → Cổng Quản trị
└── shared/          # Components, hooks, utils dùng chung
    ├── components/  # Button, Table, Modal, Form...
    ├── hooks/       # useAuth, useSupabase...
    ├── services/    # API clients
    └── utils/       # i18n, formatters...
```

**Công nghệ:**
- Vite + React 18 + TypeScript
- Ant Design 5 (UI Kit, Table, Form, DatePicker)
- React Router 6
- @supabase/supabase-js (cho realtime)
- i18next (đa ngôn ngữ)

**Các màn hình cần xây (theo thứ tự ưu tiên):**

| Portal | Màn hình | Route | API |
|--------|----------|-------|-----|
| Reader | Trang chủ OPAC | `/` | `/api/opac/newest`, `/featured` |
| Reader | Kết quả tìm kiếm | `/search?q=` | `/api/opac/search` |
| Reader | Chi tiết sách | `/works/:id` | `/api/opac/works/:id` |
| Reader | Đăng nhập/Đăng ký | `/login`, `/register` | `/api/patron/login`, `/register` |
| Reader | Khu vực cá nhân | `/profile` | `/api/patron/:id/*` |
| Librarian | Dashboard | `/librarian` | `/api/admin/dashboard` |
| Librarian | Biên mục | `/librarian/cataloging` | `/api/cataloging/*` |
| Librarian | Mượn/Trả | `/librarian/circulation` | `/api/circulation/*` |
| Admin | Dashboard | `/admin` | `/api/admin/dashboard` |
| Admin | Nhân sự | `/admin/staff` | `/api/admin/staff` |
| Admin | Báo cáo | `/admin/reports` | `/api/admin/reports/*` |
| Admin | Cấu hình | `/admin/config` | `/api/admin/config` |

**Dev estimate:** 4 tuần (2 devs)
**Backend update:** Thêm CORS cho các origin mới, serve React build

---

### 2. MOBILE APP (FLUTTER)

**Target:** App mobile cho bạn đọc (OPAC Mobile)

**Cấu trúc:**
```
mobile-app/
├── lib/
│   ├── main.dart
│   ├── screens/     # Màn hình (Home, Search, Profile...)
│   ├── services/    # API client + Supabase realtime
│   ├── models/      # Book, Patron, Circulation...
│   └── widgets/     # Component dùng chung
├── pubspec.yaml
└── ...
```

**Tính năng tối thiểu:**
- Tra cứu sách (search + barcode scan)
- Mượn/Trả (QR code thẻ bạn đọc)
- Thông báo push (FCM)
- Thẻ thư viện số (QR)
- Lịch sử mượn/trả

**Công nghệ:** Flutter 3.x + Supabase Dart Client

**Dev estimate:** 4 tuần (2 devs: 1 Flutter, 1 backend)
**Backend update:** Thêm endpoint `GET /api/patron/barcode-scan/{code}`, WebSocket push notification

---

### 3. IMPORT/EXPORT BATCH

**Target:** Nhập/xuất hàng loạt biểu ghi MARC21, CSV, Excel

**Backend:**
```
backend/src/modules/cataloging/
├── routes/catalogingRoutes.js     ← Thêm routes mới
├── services/catalogingService.js  ← Thêm service
├── imports/                        ← Mới
│   ├── iso2709.js                 ← Parse MARC21 ISO 2709
│   ├── csvImporter.js             ← Parse CSV/Excel
│   └── validator.js               ← Validate trước khi import
└── exports/                        ← Mới
    ├── iso2709.js                 ← Export MARC21 ISO 2709
    ├── excelExporter.js           ← Export Excel (.xlsx)
    └── csvExporter.js             ← Export CSV
```

**API mới:**
```
POST /api/cataloging/import      ← multipart/form-data (file)
     Body: file (ISO 2709/CSV/Excel), format, options
     Response: { imported: 50, failed: 2, errors: [...] }

GET  /api/cataloging/export      ← query params
     Query: format=csv|xlsx|iso2709, ids=1,2,3
     Response: file download
```

**Xử lý:**
- Dùng `multer` upload file, `xlsx` (npm) parse Excel
- Validate từng dòng (bắt buộc: 245$a, 852$j)
- Rollback nếu lỗi > threshold
- Preview trước khi import (UI hiển thị 10 dòng đầu)

**Backend dependencies thêm:**
- `multer` (file upload)
- `xlsx` (Excel read/write)
- `xml2js` (MARC21 XML)

**Dev estimate:** 2 tuần (1 fullstack)

---

### 4. DASHBOARD VỚI BIỂU ĐỒ

**Target:** Biểu đồ trực quan thay số liệu text

**Kỹ thuật:**
- Frontend: Recharts (React) / Chart.js (vanilla JS tạm thời)
- Backend: API đã có `GET /api/admin/dashboard`, `GET /api/admin/reports/*`

**Các biểu đồ cần:**
```
Dashboard Admin:
├── 📊 Tổng quan (4 thẻ)         → Số liệu giữ nguyên
├── 📈 Mượn/Trả 30 ngày          → Biểu đồ đường (LineChart)
├── 🥧 Phân loại DDC             → Biểu đồ tròn (PieChart)
├── 📊 Top sách mượn nhiều       → Biểu đồ cột (BarChart)
├── 🌐 Ngôn ngữ tài liệu         → Biểu đồ tròn
└── 🔥 Từ khóa tìm kiếm hot     → Word cloud / BarChart
```

**UI Estimate:** 1 tuần (1 frontend)
**Backend:** Hầu hết API đã có, chỉ cần thêm `GET /api/admin/reports/ddc-stats`

---

## 🟡 GIAI ĐOẠN 2: MỞ RỘNG NGHIỆP VỤ (Tháng 3-5)

### 5. MODULE QUẢN LÝ ẤN PHẨM ĐỊNH KỲ (SERIALS)

**Target:** Quản lý báo, tạp chí, ấn phẩm định kỳ

**Bảng CSDL mới:**
```sql
CREATE TABLE serials (
  id              SERIAL PRIMARY KEY,
  bib_id          INT REFERENCES bib_items(id),
  frequency       VARCHAR(20),         -- daily, weekly, monthly, quarterly, yearly
  first_issue     DATE,
  last_issue      DATE,
  expected_count  INT,                 -- số kỳ/năm
  vendor          VARCHAR(200),
  subscription_start DATE,
  subscription_end   DATE,
  status          VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE serial_issues (
  id              SERIAL PRIMARY KEY,
  serial_id       INT REFERENCES serials(id),
  issue_number    VARCHAR(50),
  issue_date      DATE,
  expected_date   DATE,
  received_date   DATE,
  status          VARCHAR(20),         -- expected, received, late, claimed, missing
  notes           TEXT
);

CREATE TABLE serial_claims (
  id              SERIAL PRIMARY KEY,
  issue_id        INT REFERENCES serial_issues(id),
  claim_date      DATE,
  claim_method    VARCHAR(20),         -- email, phone, mail
  response_date   DATE,
  status          VARCHAR(20),
  notes           TEXT
);
```

**Module structure:**
```
backend/src/modules/serials/
├── routes/serialsRoutes.js
├── services/serialsService.js
└── tests/...
```

**API:**
```
GET    /api/serials                    ← Danh sách ấn phẩm
POST   /api/serials                    ← Thêm ấn phẩm mới
PUT    /api/serials/:id                ← Cập nhật
DELETE /api/serials/:id                ← Xóa
GET    /api/serials/:id/issues         ← Danh sách kỳ
POST   /api/serials/:id/issues         ← Nhận kỳ mới
GET    /api/serials/overdue            ← Kỳ đến hạn chưa nhận
POST   /api/serials/claims/:id         ← Khiếu nại kỳ thiếu
GET    /api/serials/reports            ← Báo cáo định kỳ
```

**Dev estimate:** 3 tuần (1 backend + 1 frontend)

---

### 6. Z39.50 / SRU — LIÊN THÔNG THƯ VIỆN

**Target:** Kết nối và tải biểu ghi từ các thư viện khác qua giao thức Z39.50

**Kỹ thuật:**
- Dùng thư viện `z39.50` (npm: `z3950` hoặc `zoom`)
- Kết nối đến: TVQG, LOC (Library of Congress), OCLC WorldCat

**Cấu hình Z39.50 mới trong system_config:**
```
z3950_servers:
  - name: "TVQG"
    host: "tvqg.gov.vn"
    port: 210
    database: "Default"
    syntax: "MARC21"
  - name: "Library of Congress"
    host: "lx2.loc.gov"
    port: 210
    database: "LCDB"
    syntax: "MARC21"
  - name: "OCLC WorldCat"
    host: "worldcat.org"
    port: 210
    database: "WorldCat"
    syntax: "MARC21"
```

**Module structure:**
```
backend/src/modules/z3950/
├── routes/z3950Routes.js        ← 2-3 routes
├── services/
│   ├── z3950Search.js            ← Tìm kiếm Z39.50
│   └── z3950Import.js            ← Tải biểu ghi về
└── tests/
```

**API mới:**
```
POST /api/z3950/search            ← Tìm kiếm
     Body: { query, server, syntax }
     Response: { results: [...] }

POST /api/z3950/import/:id        ← Tải biểu ghi
     Body: { recordId, server }
     Response: { marcRecord }
```

**Dev estimate:** 2 tuần (1 backend)

---

### 7. TÍCH HỢP RFID & SIP2

**Target:** Kết nối thiết bị phần cứng RFID, cổng tự động, máy in mã vạch

**Kỹ thuật:**
- SIP2 (Standard Interchange Protocol 2.0) — chuẩn giao tiếp thiết bị thư viện
- Dùng thư viện `sip2` (npm) hoặc tự parse protocol
- Kết nối qua TCP socket

**Các thiết bị hỗ trợ:**
```
┌─ RFID Gate (cổng an ninh)
│  Phát hiện sách chưa mượn khi ra cửa
├─ Self-Checkout Station (kiosk tự mượn)
│  Quét thẻ → Quét sách → In hóa đơn
├─ Handheld RFID Scanner (quét cầm tay)
│  Kiểm kê kho nhanh
└─ Barcode/RFID Printer (máy in nhãn)
   In nhãn ĐKCB + RFID tag
```

**Backend module mới:**
```
backend/src/modules/hardware/
├── routes/hardwareRoutes.js
├── services/
│   ├── sip2Service.js            ← SIP2 protocol handler
│   ├── rfidService.js            ← RFID event handler
│   └── printerService.js         ← In nhãn, in thẻ
└── tests/
```

**API mới:**
```
POST /api/hardware/sip2/login     ← SIP2 login (SC Status)
POST /api/hardware/sip2/checkout  ← SIP2 Checkout
POST /api/hardware/sip2/checkin   ← SIP2 Checkin
GET  /api/hardware/sip2/status    ← SIP2 Request SC Status
POST /api/hardware/printer/label  ← In nhãn ĐKCB
POST /api/hardware/printer/card   ← In thẻ bạn đọc
```

**Cấu hình:**
```json
{
  "sip2_host": "192.168.1.100",
  "sip2_port": 6001,
  "printer_name": "Zebra ZD888",
  "rfid_reader": "UHF-900M"
}
```

**Dev estimate:** 3 tuần (1 backend + 1 hardware integration)

---

### 8. MODULE BỔ SUNG & NGÂN SÁCH (ACQUISITIONS)

**Target:** Quản lý quy trình đặt mua, nhận, thanh toán tài liệu

**Bảng CSDL mới:**
```sql
CREATE TABLE vendors (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  code            VARCHAR(50) UNIQUE,
  contact_person  VARCHAR(200),
  email           VARCHAR(100),
  phone           VARCHAR(20),
  address         TEXT,
  tax_code        VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE purchase_orders (
  id              SERIAL PRIMARY KEY,
  po_number       VARCHAR(50) UNIQUE NOT NULL,
  vendor_id       INT REFERENCES vendors(id),
  order_date      DATE NOT NULL,
  expected_date   DATE,
  total_amount    DECIMAL(12,0),
  status          VARCHAR(20),       -- pending, approved, sent, partial, complete, cancelled
  notes           TEXT,
  created_by      INT REFERENCES users(id),
  approved_by     INT REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE po_items (
  id              SERIAL PRIMARY KEY,
  po_id           INT REFERENCES purchase_orders(id),
  title           VARCHAR(500) NOT NULL,
  author          VARCHAR(200),
  isbn            VARCHAR(20),
  quantity        INT DEFAULT 1,
  unit_price      DECIMAL(12,0),
  received_qty    INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'pending'  -- pending, partial, complete
);

CREATE TABLE funds (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE,
  name            VARCHAR(200),
  total_amount    DECIMAL(12,0),
  spent_amount    DECIMAL(12,0) DEFAULT 0,
  fiscal_year     INT,
  status          VARCHAR(20) DEFAULT 'active'
);
```

**Module:**
```
backend/src/modules/acquisitions/
├── routes/acquisitionsRoutes.js
├── services/
│   ├── vendorService.js
│   ├── purchaseOrderService.js
│   └── fundService.js
└── tests/
```

**Frontend màn hình:**
```
Admin → Bổ sung
├── 📋 Dashboard bổ sung
├── 🏢 Quản lý nhà cung cấp
├── 📄 Tạo đơn đặt hàng (PO)
├── 📥 Nhận hàng
├── 💰 Quản lý ngân sách
└── 📊 Báo cáo bổ sung
```

**Dev estimate:** 3 tuần (1 fullstack)

---

### 9. QUẢN LÝ DANH SÁCH CHỦ ĐỀ (AUTHORITY CONTROL)

**Target:** Kiểm soát tiêu đề chuẩn cho tác giả, chủ đề, địa danh

**Bảng CSDL:**
```sql
CREATE TABLE authorities (
  id              SERIAL PRIMARY KEY,
  type            VARCHAR(20) NOT NULL,   -- personal, corporate, subject, geographic, genre
  heading         VARCHAR(500) NOT NULL,  -- tiêu đề chuẩn
  see_from        TEXT[],                  -- từ tham chiếu "xem"
  see_also        TEXT[],                  -- từ tham chiếu "xem thêm"
  source          VARCHAR(50),             -- TVQG, LOC, tự tạo
  notes           TEXT,
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Tích hợp:**
- Khi biên mục 600/610/650/651 → gợi ý từ authority
- Tự động cập nhật khi authority thay đổi
- Tạo liên kết "Xem" / "Xem thêm" trên OPAC

**Dev estimate:** 2 tuần (1 backend + 1 frontend)

---

## 🔴 GIAI ĐOẠN 3: HỆ SINH THÁI (Tháng 4-6)

### 10. PLUGIN ARCHITECTURE

**Target:** Cho phép mở rộng chức năng mà không sửa core code

**Kiến trúc:**
```
backend/
├── src/
│   ├── plugins/                    ← Manager + Loader
│   │   ├── pluginManager.js        ← Load, init, hook
│   │   ├── pluginBase.js           ← Base class
│   │   └── hooks.js                ← Hook registry
│   └── modules/plugins/            ← Plugin vị trí (có thể ở ngoài)
│       ├── plugin-example/
│       │   ├── manifest.json       ← Tên, version, hook
│       │   ├── index.js
│       │   └── views/              ← Frontend component
│       └── ...
```

**Plugin manifest:**
```json
{
  "name": "vnpay-payment",
  "version": "1.0.0",
  "hooks": {
    "circulation:afterCheckin": "handlePayment",
    "admin:configForm": "renderConfig"
  },
  "frontend": {
    "components": [{"name": "PaymentModal", "path": "PaymentModal.jsx"}]
  }
}
```

**Plugin types:**
- **Payment:** Tích hợp VNPay, Momo, PayPal
- **Notification:** Email, SMS, Zalo OA, Facebook Messenger
- **Search Engine:** Thay thế search (Elasticsearch, MeiliSearch)
- **Report:** Thêm báo cáo tùy chỉnh
- **Import/Export:** Format mới (JSON, XML, PDF)

**Dev estimate:** 3 tuần (1 senior backend)

---

### 11. SELF-CHECKOUT / TỰ PHỤC VỤ

**Target:** Kiosk tự mượn sách, tự đăng ký thẻ

**Kiosk module:**
```
frontend/kiosk/
├── public/index.html
├── src/
│   ├── App.jsx
│   ├── screens/
│   │   ├── Welcome.jsx           ← Màn hình chào
│   │   ├── ScanCard.jsx          ← Quét thẻ bạn đọc
│   │   ├── ScanBooks.jsx         ← Quét sách
│   │   ├── Confirm.jsx           ← Xác nhận + in phiếu
│   │   └── Complete.jsx          ← Hoàn tất
│   └── services/kioskApi.js
```

**Tính năng:**
- Self-checkout: Quét thẻ → Quét sách → Xác nhận
- Self-registration: CCCD/CMND → Tự động tạo thẻ
- Tra cứu OPAC: màn hình cảm ứng
- In phiếu mượn (máy in nhiệt)

**Backend:**
```
POST /api/kiosk/login             ← Quét thẻ
POST /api/kiosk/checkout          ← Mượn
POST /api/kiosk/register          ← Đăng ký
GET  /api/kiosk/patron-info       ← Tra cứu bạn đọc
```

**Dev estimate:** 3 tuần (1 fullstack + hardware)

---

### 12. UNION CATALOG — LIÊN KẾT NHIỀU THƯ VIỆN

**Target:** Catalog dùng chung cho nhiều thư viện trong hệ thống

**Kiến trúc:**
```
┌─────────────────────────────────────────────────────┐
│                 YONGIN UNION CATALOG                 │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ TV Đà    │  │ TV Q.Nam │  │ TV Huế  │  ...       │
│  │ Nẵng     │  │          │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│  Mỗi thư viện có database riêng,                      │
│  chia sẻ qua Union Search API                         │
└─────────────────────────────────────────────────────┘
```

**Bảng CSDL:**
```sql
CREATE TABLE union_libraries (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(20) UNIQUE,
  name            VARCHAR(200),
  api_url         VARCHAR(500),
  api_key         VARCHAR(200),
  status          VARCHAR(20) DEFAULT 'active',
  last_sync       TIMESTAMP
);

CREATE TABLE union_search_log (
  id              SERIAL PRIMARY KEY,
  query           TEXT,
  results_count   INT,
  libraries_searched INT,
  response_time_ms INT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Cơ chế:**
- **Union Search:** Khi bạn đọc tìm kiếm → gửi request song song đến tất cả thư viện
- **Kết quả gộp:** Sắp xếp, loại trùng theo ISBN
- **Đặt mượn liên thư viện:** Nếu sách không có ở TV nhà → đề xuất mượn từ TV khác
- **Đồng bộ định kỳ:** hàng đêm sync biểu ghi mới

**API mới:**
```
GET /api/union/search?q=...        ← Tìm trên tất cả TV
GET /api/union/libraries           ← DS thư viện trong mạng lưới
POST /api/union/borrow             ← Đặt mượn liên thư viện
GET  /api/union/borrow/:id/track   ← Theo dõi trạng thái
```

**Dev estimate:** 4 tuần (2 devs: backend + frontend)

---

## 📅 LỘ TRÌNH & PHÂN CÔNG

```
Tháng  | Sprint | Nội dung                    | Frontend | Backend  | Dev(s)
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T1-W1  | S1     | React scaffold + shared UI  | 2 devs   | —        | 2 FE
T1-W2  | S1     | Reader portal (OPAC)        | 2 devs   | —        | 2 FE
T1-W3  | S2     | Librarian portal            | 2 devs   | —        | 2 FE
T1-W4  | S2     | Admin portal + responsive   | 2 devs   | —        | 2 FE
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T2-W1  | S3     | Import/Export batch         | 1 dev    | 1 dev    | 2 fullstack
T2-W2  | S3     | Dashboard biểu đồ           | 1 dev    | 1 dev    | 2 fullstack
T2-W3  | S4     | Mobile App Flutter - Core   | 2 devs   | —        | 2 mobile
T2-W4  | S4     | Mobile App - Hoàn thiện     | 2 devs   | —        | 2 mobile
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T3-W1  | S5     | Serials module (backend)    | —        | 1 dev    | 1 BE
T3-W2  | S5     | Serials module (frontend)   | 1 dev    | —        | 1 FE
T3-W3  | S6     | Z39.50/SRU                  | —        | 1 dev    | 1 BE
T3-W4  | S6     | RFID/SIP2 integration       | —        | 2 devs   | 2 BE
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T4-W1  | S7     | Acquisitions backend        | —        | 1 dev    | 1 BE
T4-W2  | S7     | Acquisitions frontend       | 1 dev    | —        | 1 FE
T4-W3  | S8     | Authority control           | 1 dev    | 1 dev    | 2 fullstack
T4-W4  | S8     | Bug fixes + Testing         | Đều      | Đều      | All
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T5-W1  | S9     | Plugin architecture core    | —        | 1 dev    | 1 BE
T5-W2  | S9     | Plugin + VNPay demo         | 1 dev    | 1 dev    | 2 fullstack
T5-W3  | S10    | Self-checkout kiosk         | 1 dev    | 1 dev    | 2 fullstack
T5-W4  | S10    | Kiosk + hardware test       | 1 dev    | 1 dev    | 2 fullstack
───────┼────────┼──────────────────────────────┼──────────┼──────────┼────────
T6-W1  | S11    | Union catalog backend       | —        | 2 devs   | 2 BE
T6-W2  | S11    | Union catalog frontend      | 1 dev    | —        | 1 FE
T6-W3  | S12    | Docker + CI/CD              | 1 dev    | 1 dev    | 2 infra
T6-W4  | S12    | Deployment + Testing        | Đều      | Đều      | All
```

## 👥 NHÂN SỰ YÊU CẦU

| Vai trò | Số lượng | Kỹ năng |
|---------|----------|---------|
| Frontend React | 2 | React 18, TypeScript, Ant Design, Recharts |
| Backend Node.js | 2 | Express, Supabase, PostgreSQL, REST API |
| Fullstack | 2 | Cả React + Node.js |
| Mobile Flutter | 2 | Flutter/Dart, Supabase Dart, Firebase |
| Hardware | 1 | SIP2, RFID, TCP socket, máy in nhiệt |
| DevOps | 1 | Docker, Nginx, CI/CD, Supabase |

**Tổng:** ~6-7 devs (có thể thay đổi tùy kinh nghiệm)

---

## 🛠 BACKLOG KỸ THUẬT SONG SONG

Các cải tiến kỹ thuật nên làm song song với phát triển tính năng:

| # | Công việc | Priority | Ghi chú |
|---|-----------|----------|---------|
| B1 | Tạo `exec_sql` function trong Supabase | 🔴 Cao | Fix lỗi `database.js` |
| B2 | Chuyển patronService sang `.supabase.js` | 🔴 Cao | Patron auth đang lỗi |
| B3 | Thêm unit test (Jest) cho các module | 🟡 TB | Hiện chỉ có 1 file test |
| B4 | Docker Compose cho dev (PostgreSQL + App) | 🟡 TB | infra/docker trống |
| B5 | Swagger/OpenAPI docs | 🟡 TB | Tự động từ routes |
| B6 | CI/CD với GitHub Actions | 🟢 Thấp | Deploy tự động |
| B7 | Monitoring (Sentry, Grafana) | 🟢 Thấp | infra/monitoring trống |

---

## 💰 ƯỚC TÍNH CHI PHÍ

| Hạng mục | Thời gian | Dev | Ngày công | Chi phí* |
|----------|-----------|-----|-----------|----------|
| GĐ 1: MVP hoàn thiện | 2 tháng | 4 devs | ~160 ngày | ~320M |
| GĐ 2: Mở rộng | 2 tháng | 3 devs | ~120 ngày | ~240M |
| GĐ 3: Hệ sinh thái | 2 tháng | 5 devs | ~200 ngày | ~400M |
| Hạ tầng (Supabase Pro, Server...) | 6 tháng | — | — | ~30M |
| Dự phòng (20%) | — | — | — | ~200M |
| **Tổng** | **6 tháng** | **~6 devs** | **~480 ngày** | **~1.2 tỷ VND** |

*Chi phí ước tính ~2.5tr/ngày công cho dev Việt Nam (trung bình senior).

---

> **Kết luận:** Ưu tiên số 1 là **Responsive UI (React)** — đây là nền tảng cho mọi tính năng sau. Không có giao diện tốt, các tính năng khác không thể hiện được. Sau đó đến **Import/Export batch** và **Dashboard biểu đồ** vì tác động trực tiếp đến trải nghiệm người dùng hàng ngày.
