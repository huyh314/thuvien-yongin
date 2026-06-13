# 🚀 Hướng dẫn chuyển sang Supabase

> **Phần mềm Thư viện Yongin — Chuyển từ PostgreSQL thuần sang Supabase**

---

## 📋 Mục lục

1. [Supabase là gì và tại sao nên dùng?](#1-supabase-là-gì-và-tại-sao-nên-dùng)
2. [Tổng quan kiến trúc mới](#2-tổng-quan-kiến-trúc-mới)
3. [Bước 1: Tạo Supabase Project](#3-bước-1-tạo-supabase-project)
4. [Bước 2: Chạy Migration (Schema)](#4-bước-2-chạy-migration-schema)
5. [Bước 3: Cập nhật Backend kết nối Supabase](#5-bước-3-cập-nhật-backend-kết-nối-supabase)
6. [Bước 4: Cập nhật Auth (nếu muốn dùng Supabase Auth)](#6-bước-4-cập-nhật-auth-nếu-muốn-dùng-supabase-auth)
7. [Bước 5: Supabase Storage cho ảnh bìa](#7-bước-5-supabase-storage-cho-ảnh-bìa)
8. [Bước 6: Supabase Realtime cho thông báo](#8-bước-6-supabase-realtime-cho-thông-báo)
9. [Kiến trúc cuối cùng](#9-kiến-trúc-cuối-cùng)

---

## 1. Supabase là gì và tại sao nên dùng?

**Supabase** là "Firebase thay thế bằng PostgreSQL" — một nền tảng backend-as-a-service mã nguồn mở, gồm:

| Tính năng | Mô tả | Dùng trong Yongin? |
|-----------|-------|-------------------|
| **PostgreSQL Database** | CSDL quan hệ đầy đủ | ✅ Toàn bộ dữ liệu |
| **Auth** | Xác thực người dùng (JWT, OAuth, magic link) | ✅ Có thể thay thế auth tự code |
| **Storage** | Lưu trữ file (ảnh bìa, avatar) | ✅ Ảnh bìa sách |
| **Realtime** | WebSocket realtime | ✅ Thông báo bạn đọc |
| **Auto-generated API** | REST API tự động từ schema | ❌ Không dùng (code tự có) |

### Lợi ích khi dùng Supabase cho Yongin:

- ✅ **Không cần tự quản lý PostgreSQL** — Supabase lo backup, scaling, monitoring
- ✅ **Auth sẵn** — không cần code JWT, refresh token, hash password
- ✅ **Storage sẵn** — không cần MinIO, upload ảnh bìa dễ dàng
- ✅ **Realtime** — thông báo đến bạn đọc không cần WebSocket riêng
- ✅ **Row Level Security (RLS)** — bảo vệ dữ liệu ở cấp database
- ✅ **Tự động sinh TypeScript types** từ schema
- ✅ **Có dashboard quản lý** — xem dữ liệu trực tiếp trên web

---

## 2. Tổng quan kiến trúc mới

```
┌─────────────────────────────────────────────────────────────┐
│                     KIẾN TRÚC MỚI                          │
│                                                             │
│   Frontend (React/Vue)                                      │
│       ↕ HTTP                                                │
│   Backend (Node.js/Express)                                 │
│       ↕ @supabase/supabase-js                               │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                 SUPABASE CLOUD                      │  │
│   │                                                     │  │
│   │  ┌─────────────────┐  ┌───────────────────┐        │  │
│   │  │  PostgreSQL DB   │  │  Auth              │        │  │
│   │  │  (21 bảng)       │  │  • JWT tự động    │        │  │
│   │  │  • RLS bảo vệ    │  │  • Email/Password │        │  │
│   │  └─────────────────┘  │  • Google/GitHub   │        │  │
│   │                       └───────────────────┘        │  │
│   │  ┌─────────────────┐  ┌───────────────────┐        │  │
│   │  │  Storage         │  │  Realtime          │        │  │
│   │  │  • Ảnh bìa sách  │  │  • Thông báo      │        │  │
│   │  │  • Avatar bạn đọc│  │  • Push notification│      │  │
│   │  └─────────────────┘  └───────────────────┘        │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Bước 1: Tạo Supabase Project

### 3.1. Đăng ký Supabase

1. Vào [https://supabase.com](https://supabase.com)
2. Đăng ký (GitHub account là nhanh nhất)
3. Tạo tổ chức (Organization) — đặt tên: `ThuVienYongin`

### 3.2. Tạo project mới

```
Project name:     thu-vien-yongin
Database password: [tự đặt, VD: Yongin@2026!]
Region:           Singapore (gần Việt Nam nhất, latency thấp)
Pricing plan:     Free (500MB DB, 1GB Storage, 50,000 monthly active users)
```

> ⚠️ **Lưu ý:** Region chọn **Singapore** — latency thấp nhất cho Việt Nam.  
> ⚠️ **Free Plan** đủ dùng cho thư viện quy mô vừa (< 10.000 đầu sách). Nếu lớn hơn, nâng lên Pro ($25/tháng).

### 3.3. Lấy thông tin kết nối

Sau khi project tạo xong, vào **Project Settings → Database**:

```
🔐 Project URL:    https://abcdefghijklm.supabase.co
🔐 Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔐 Service Role Key: eyJhbGciOiJI... (giữ bí mật — chỉ dùng backend)
```

> **Lưu vào `.env`:** (xem bước 3)

---

## 4. Bước 2: Chạy Migration (Schema)

### Cách 1 — Dùng Supabase SQL Editor (đơn giản nhất)

1. Vào Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy toàn bộ nội dung file `001_schema.sql` vào
4. Chạy (⌘+Enter)

### Cách 2 — Dùng Supabase CLI (cho CI/CD)

```bash
# Cài Supabase CLI
npm install -g supabase

# Login
supabase login

# Init project
cd backend
supabase init

# Link với remote project
supabase link --project-ref abcdefghijklm

# Chạy migration
supabase db push
```

### ✅ Verify

Sau khi chạy, kiểm tra trong **Table Editor** → thấy 21 bảng đã được tạo.

---

## 5. Bước 3: Cập nhật Backend kết nối Supabase

### 5.1. Cài đặt thư viện

```bash
cd backend
npm install @supabase/supabase-js
# Có thể gỡ pg nếu không dùng nữa: npm uninstall pg
```

### 5.2. Tạo Supabase client

```javascript
// src/config/supabase.js — THAY THẾ cho database.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Dùng service_role key để bypass RLS (cho backend)
// KHÔNG bao giờ exposed service_role key ra frontend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

### 5.3. Cập nhật `.env`

```env
# ─── Thay vì DB_HOST, DB_PORT, DB_NAME...
# ─── Dùng Supabase:
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...   ← dùng cho frontend
SUPABASE_SERVICE_KEY=eyJhbGciOiJ... ← dùng cho backend (giữ bí mật)
```

### 5.4. File so sánh: `pg` vs Supabase client

#### Cách cũ (dùng `pg`):
```javascript
const pool = require('../config/database');
const result = await pool.query('SELECT * FROM bib_items WHERE id = $1', [id]);
```

#### Cách mới (dùng Supabase):
```javascript
const supabase = require('../config/supabase');
const { data, error } = await supabase
  .from('bib_items')
  .select('*')
  .eq('id', id)
  .single();
if (error) throw error;
return data;
```

### 5.5. So sánh query patterns

| Thao tác | `pg` (cũ) | Supabase (mới) |
|----------|-----------|----------------|
| **SELECT 1 dòng** | `pool.query('SELECT * FROM t WHERE id=$1', [id])` | `supabase.from('t').select('*').eq('id', id).single()` |
| **SELECT nhiều dòng** | `pool.query('SELECT * FROM t WHERE status=$1', [s])` | `supabase.from('t').select('*').eq('status', s)` |
| **INSERT** | `pool.query('INSERT INTO t (a,b) VALUES ($1,$2) RETURNING *', [a, b])` | `supabase.from('t').insert({ a, b }).select().single()` |
| **UPDATE** | `pool.query('UPDATE t SET a=$1 WHERE id=$2', [a, id])` | `supabase.from('t').update({ a }).eq('id', id).select()` |
| **DELETE** | `pool.query('DELETE FROM t WHERE id=$1', [id])` | `supabase.from('t').delete().eq('id', id)` |
| **Raw query** | `pool.query('SELECT COUNT(*) FROM t')` | `supabase.rpc('function_name', params)` hoặc `supabase.from('t').select('*', { count: 'exact', head: true })` |
| **Transaction** | BEGIN/COMMIT/ROLLBACK | Dùng `supabase.rpc()` với custom function (PostgreSQL function) |

### 5.6. Xử lý transaction trong Supabase

Supabase client **không hỗ trợ transaction trực tiếp**. Các giải pháp:

**Giải pháp A (khuyên dùng):** Viết PostgreSQL function cho logic phức tạp

```sql
-- Tạo function trong Supabase SQL Editor
CREATE OR REPLACE FUNCTION checkout_books(
  p_patron_barcode TEXT,
  p_item_barcodes TEXT[],
  p_librarian_id INT
) RETURNS JSONB AS $$
DECLARE
  v_patron_id INT;
  v_result JSONB;
BEGIN
  -- toàn bộ logic checkout ở đây
  -- tự động có transaction
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Gọi từ Node.js:
```javascript
const { data, error } = await supabase.rpc('checkout_books', {
  p_patron_barcode: 'TV000123',
  p_item_barcodes: ['M.102568', 'M.203456'],
  p_librarian_id: 1
});
```

**Giải pháp B (dễ hơn, giữ code cũ):** Vẫn dùng `pg` pool song song

```javascript
// supabase.js — export cả supabase client + pg pool
const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL, // Lấy từ Project Settings → Database → Connection string
  ssl: { rejectUnauthorized: false }
});

module.exports = { supabase, pgPool };
```

→ Code nào cần transaction → dùng `pgPool`  
→ Code nào select/insert đơn giản → dùng `supabase`

---

## 6. Bước 4: Cập nhật Auth (nếu muốn dùng Supabase Auth)

### So sánh: Custom Auth vs Supabase Auth

| Tiêu chí | Custom Auth (đã code) | Supabase Auth |
|----------|----------------------|---------------|
| **JWT** | ✅ Tự generate + verify | ✅ Tự động |
| **Hash password** | ✅ bcrypt | ✅ Tự động |
| **Refresh token** | ✅ Tự code | ✅ Có sẵn |
| **OAuth (Google, Facebook)** | ❌ Phải tự code | ✅ Có sẵn |
| **Magic link (email)** | ❌ | ✅ Có sẵn |
| **RLS (Row Level Security)** | ❌ | ✅ Tích hợp sẵn |
| **Admin dashboard quản lý user** | ❌ | ✅ Có sẵn |
| **Quên mật khẩu** | ❌ Phải tự code | ✅ Có sẵn |

### Khuyến nghị: **Giữ custom auth trước, migrate dần sau**

Việc chuyển auth phức tạp hơn DB. Em khuyên nên:

```
GIAI ĐOẠN 1 (Ngay bây giờ): 
  - DB → Supabase PostgreSQL (giữ nguyên code backend)
  - Chỉ thay connection string

GIAI ĐOẠN 2 (Sau 1-2 tuần):
  - Dùng Supabase Auth cho BẠN ĐỌC (patron login)
  - Giữ custom auth cho Admin/Thủ thư

GIAI ĐOẠN 3 (Sau 1 tháng):
  - Chuyển hoàn toàn sang Supabase Auth
  - Thêm OAuth (Google login)
```

---

## 7. Bước 5: Supabase Storage cho ảnh bìa

### 7.1. Tạo bucket

Vào Supabase Dashboard → **Storage** → **Create bucket**:

```
Bucket name:    book-covers
Public:         ON (để frontend có thể đọc ảnh trực tiếp)
```

### 7.2. Upload ảnh từ backend

```javascript
// Trong catalogingService.js — thay vì lưu URL
const supabase = require('../../config/supabase');

async function uploadCoverImage(fileBuffer, fileName, mimeType) {
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(`covers/${fileName}`, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  // Lấy public URL
  const { data: { publicUrl } } = supabase.storage
    .from('book-covers')
    .getPublicUrl(`covers/${fileName}`);

  return publicUrl;
}
```

### 7.3. API upload ảnh

```javascript
// Thêm vào catalogingRoutes.js
router.post('/records/:id/cover', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const file = req.file; // dùng multer
    const url = await uploadCoverImage(file.buffer, `cover_${req.params.id}.jpg`, file.mimetype);
    
    await supabase.from('bib_items').update({ cover_url: url }).eq('marc_record_id', req.params.id);
    
    return res.json({ coverUrl: url });
  } catch (error) {
    return res.status(500).json({ error: 'UPLOAD_FAILED', message: 'Lỗi upload ảnh.' });
  }
});
```

---

## 8. Bước 6: Supabase Realtime cho thông báo

### 8.1. Kích hoạt Realtime

Vào Supabase Dashboard → **Database** → **Replication** → Bật Realtime cho bảng `notifications`.

### 8.2. Lắng nghe thay đổi từ frontend

```javascript
// frontend/src/services/realtime.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lắng nghe thông báo mới cho bạn đọc
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `patron_id=eq.${patronId}` },
    (payload) => {
      console.log('Thông báo mới:', payload.new);
      // Hiển thị notification trên UI
      showNotification(payload.new.title, payload.new.body);
    }
  )
  .subscribe();
```

---

## 9. Kiến trúc cuối cùng

```
┌─────────────────────────────────────────────────────────────┐
│                    KIẾN TRÚC SUPABASE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND (React/Vue)                                       │
│  ├─ Gọi API → Backend                                       │
│  ├─ Kết nối Realtime → Supabase (WS)                        │
│  └─ Upload ảnh → Supabase Storage                           │
│                                                             │
│  BACKEND (Node.js/Express)                                  │
│  ├─ Xử lý logic nghiệp vụ                                   │
│  ├─ Gọi Supabase client → DB + Auth + Storage              │
│  └─ Custom Auth cho Admin/Thủ thư (JWT)                    │
│                                                             │
│  SUPABASE                                                  │
│  ├─ PostgreSQL Database (21 bảng)                          │
│  │  ├─ RLS: Patron chỉ xem được dữ liệu của mình          │
│  │  └─ Hỗ trợ transaction qua pg function                  │
│  ├─ Auth                                                    │
│  │  ├─ Bạn đọc: Supabase Auth (email + Google)            │
│  │  └─ Admin/Thủ thư: Custom Auth (giữ code cũ)          │
│  ├─ Storage                                                 │
│  │  ├─ bucket: book-covers (public)                        │
│  │  └─ bucket: patron-avatars (private)                    │
│  └─ Realtime                                                │
│     └─ Bảng notifications → đẩy realtime đến bạn đọc      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist chuyển đổi

### 🔴 LÀM NGAY (1 ngày):

- [ ] Đăng ký Supabase, tạo project (region Singapore)
- [ ] Chạy `001_schema.sql` trong SQL Editor
- [ ] Cập nhật `.env` với Supabase URL + keys
- [ ] Tạo `src/config/supabase.js`
- [ ] Cài `@supabase/supabase-js`
- [ ] Test kết nối: dùng Supabase client SELECT 1 bảng
- [ ] Tạo bucket `book-covers` trên Storage
- [ ] Seed dữ liệu mẫu (admin, roles, cutter_table)

### 🟡 LÀM SAU (1-2 tuần):

- [ ] Migrate auth bạn đọc sang Supabase Auth
- [ ] Thêm RLS policies cho bảng patrons, circulation
- [ ] Viết PostgreSQL function cho transaction (checkout, checkin)
- [ ] Thêm OAuth Google login cho bạn đọc
- [ ] Upload ảnh bìa qua Supabase Storage

### 🟢 LÀM SAU (1 tháng):

- [ ] Migrate toàn bộ auth sang Supabase Auth
- [ ] Thêm realtime notifications
- [ ] Tự động đồng bộ schema với Supabase CLI
- [ ] Set up backup tự động (Supabase có sẵn)

---

## 💡 Mẫu prompt cho AI — Chuyển code sang Supabase

Khi đã có tài khoản Supabase và muốn AI chuyển code từ `pg` sang Supabase:

````
Đã đọc file HUONG_DAN_SUPABASE.md. 

Tôi đã tạo Supabase project: https://abcdefghijklm.supabase.co
Tôi đã chạy migration 001_schema.sql thành công.

Bây giờ hãy chuyển module [tên module — VD: patron] từ dùng pg pool sang dùng @supabase/supabase-js.

YÊU CẦU:
1. Tạo file src/config/supabase.js với Supabase client (service_role key)
2. Chuyển tất cả pool.query() trong services/patronService.js sang supabase.from().select()...
3. Với transaction thì dùng supabase.rpc() — tạo PostgreSQL function trước
4. .env cần: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
5. KHÔNG cần thay đổi routes — chỉ services

RIÊNG AUTH: Giữ custom auth cho admin/librarian. Chưa chuyển sang Supabase Auth.
STORAGE: Dùng supabase.storage.from('book-covers') cho upload ảnh.
````

---

> **Tài liệu tham khảo:**  
> - [Supabase Documentation](https://supabase.com/docs)  
> - [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/introduction)  
> - [Supabase Auth](https://supabase.com/docs/guides/auth)  
> - [Supabase Storage](https://supabase.com/docs/guides/storage)  
> - [Supabase Realtime](https://supabase.com/docs/guides/realtime)
