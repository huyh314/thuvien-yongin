# 📋 REVIEW CỔNG THỦ THƯ — Lấy từ giao diện và API

> Đăng nhập: `librarian` / `lib123` — Thủ thư mặc định (5 module: cataloging, circulation, patron, collection, report)

---

## ✅ HOẠT ĐỘNG TỐT

| Tính năng | Kết quả |
|-----------|---------|
| **Đăng nhập** | ✅ Thành công, JWT + Refresh token |
| **Dashboard** | ✅ Hiện stats: 27 sách, 53 bản sao, 10 bạn đọc, 3 nhân viên |
| **Tra trùng biểu ghi** | ✅ `POST /search-duplicate` — phát hiện sách trùng |
| **Sinh mã Cutter** | ✅ "Dế Mèn phiêu lưu ký" → D200M (TP1=D, TP2=200, TP3=M) |
| **Tìm kiếm biểu ghi** | ✅ "van" → 4 kết quả |
| **Gợi ý DDC** | ✅ Dựa trên nhan đề + chủ đề |
| **Thống kê lưu thông** | ✅ 1 checkout, 1 checkin, 0 quá hạn |
| **Import CSV** | ✅ Nhập sách hàng loạt |
| **Export CSV/Excel/MARC** | ✅ Xuất được tất cả định dạng |
| **Checkout/Checkin** | ✅ Mượn + trả sách thành công (test ở session trước) |

## ⚠️ CẦN SỬA

| Vấn đề | API | Nguyên nhân | Giải pháp |
|--------|-----|-------------|-----------|
| **Tìm bạn đọc** lỗi | `GET /patron/search` | Dùng `pool.query()` (exec_sql) không available | Chuyển sang `supabase.from()` |
| **Kho** lỗi | `GET /collection/sections` | Dùng `pool.query()` | Chuyển sang `supabase.from()` |
| **Patron checkouts** | `GET /circulation/patron/:id/checkouts` | Route không tồn tại | Thêm route hoặc update route |

## 📊 ĐÁNH GIÁ GIAO DIỆN

### Màn hình Dashboard
```
✅ Hiển thị 4 thẻ stats (đầu sách, bạn đọc, đang mượn, quá hạn)
✅ Sidebar menu với 6 mục chính
✅ Menu: Dashboard, Biên mục, Mượn, Trả, Bạn đọc, Kho
⚠️ Thiếu danh sách sách quá hạn (API trả về rỗng)
⚠️ Chưa có thống kê nhanh (giao dịch hôm nay, sách chờ xử lý)
```

### Màn hình Biên mục
```
✅ Form MARC21 với 12+ trường (245, 100, 260, 020, 082, 852, 650, ...)
✅ Tra trùng, sinh Cutter, gợi ý DDC
✅ Chọn kho (4 loại)
⚠️ Thiếu các trường: 246, 250, 490, 500, 504, 520, 600, 610, 651, 653, 655, 700, 710, 910
⚠️ Chưa có preview biểu ghi MARC21 trước khi lưu
⚠️ Chưa có import ảnh bìa từ form
⚠️ Chưa có gợi ý từ khóa TVQG tự động
```

### Màn hình Mượn/Trả
```
✅ UI nhập mã thẻ + quét sách
⚠️ Chưa có auto-complete khi quét thẻ
⚠️ Chưa có barcode scanner trên web (cần libib-style)
⚠️ Chưa hiển thị hạn mức bạn đọc rõ ràng
⚠️ Thiếu nút in phiếu mượn
```

### Màn hình Kho
```
⚠️ API lỗi (INTERNAL_ERROR) → UI không hiển thị
⚠️ Cần sửa backend trước
```

## 🎯 ĐỀ XUẤT CẢI THIỆN NGẮN HẠN

| # | Cải thiện | Effort | Tác động |
|---|-----------|--------|----------|
| 1 | Sửa patronSearch dùng `supabase.from()` | 30 phút | 🔥🔥🔥 Tìm bạn đọc |
| 2 | Sửa collection sections dùng `supabase.from()` | 30 phút | 🔥🔥🔥 Xem kho |
| 3 | Thêm 10 trường MARC21 còn thiếu vào form | 2 giờ | 🔥🔥 Biên mục đầy đủ |
| 4 | Preview MARC21 trước khi lưu | 2 giờ | 🔥🔥 Kiểm tra biểu ghi |
| 5 | Auto-complete cho tác giả, NXB, từ khóa | 3 giờ | 🔥🔥 Giảm gõ tay |
| 6 | In phiếu mượn (print receipt) | 1 giờ | 🔥🔥 Tiện lợi |
