# 🏗️ KẾ HOẠCH HOÀN THIỆN — PHẦN MỀM THƯ VIỆN YONGIN

> Phiên bản: 2.0 | Ngày: 12/06/2026 | Dựa trên Báo cáo Đối chiếu TongThe_UngDung.md
> Tổng: 18 hạng mục, 3 giai đoạn, 12 tuần, ~5 devs

---

## 📊 TỔNG QUAN

```
HIỆN TẠI: 65% hoàn thiện (62/95 yêu cầu)
MỤC TIÊU: 95% hoàn thiện (90/95 yêu cầu)

GIAI ĐOẠN 1 (Tuần 1-4):  Hạ tầng + Trải nghiệm   →  +15%  (80%)
GIAI ĐOẠN 2 (Tuần 5-8):  Nghiệp vụ chuyên sâu    →  +10%  (90%)
GIAI ĐOẠN 3 (Tuần 9-12): Hoàn thiện + Vận hành    →  +5%   (95%)
```

---

## 🟢 GIAI ĐOẠN 1: HẠ TẦNG + TRẢI NGHIỆM NGƯỜI DÙNG (Tuần 1-4, 3 devs)

### Mục tiêu: Elasticsearch, Storage, Mobile, Đặt mượn online, News, TVQG

---

### 1.1. ELASTICSEARCH — Full-text Search Engine (Tuần 1-2)

**Hiện trạng:** Dùng PostgreSQL `ILIKE` → chậm với >10k records, không có highlight, không có suggest nâng cao

**Cần làm:**

#### 1.1.1. Cài đặt Elasticsearch (Ngày 1)

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:8.15.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports: ['9200:9200']
    volumes: ['./es_data:/usr/share/elasticsearch/data']
```

```bash
# Backend dependencies
cd backend && npm install @elastic/elasticsearch
```

#### 1.1.2. Tạo Elasticsearch Service (Ngày 1-2)

```
backend/src/services/
├── elasticsearch.js         ← ES client + index management
└── searchService.js         ← Unified search (ES + fallback DB)
```

```javascript
// backend/src/services/elasticsearch.js
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

// Tạo index với Vietnamese analyzer
async function createIndex() {
  await client.indices.create({
    index: 'bib_items',
    body: {
      settings: {
        analysis: {
          filter: { vietnamese_stop: { type: 'stop', stopwords: '_vietnamese_' } },
          analyzer: {
            vietnamese_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'vietnamese_stop']
            }
          }
        }
      },
      mappings: {
        properties: {
          title: { type: 'text', analyzer: 'vietnamese_analyzer' },
          title_search: { type: 'text', analyzer: 'standard' },
          author_main: { type: 'text', analyzer: 'standard' },
          isbn: { type: 'keyword' },
          subjects: { type: 'text' },
          summary: { type: 'text', analyzer: 'vietnamese_analyzer' },
          publish_year: { type: 'integer' },
          language_code: { type: 'keyword' },
          available_copies: { type: 'integer' }
        }
      }
    }
  });
}

// Index một sách
async function indexBook(book) {
  await client.index({
    index: 'bib_items',
    id: book.id.toString(),
    body: {
      title: book.title,
      title_search: book.title_search,
      author_main: book.author_main,
      isbn: book.isbn,
      subjects: book.subjects,
      summary: book.summary,
      publish_year: book.publish_year,
      language_code: book.language_code,
      available_copies: book.available_copies,
      cover_url: book.cover_url
    }
  });
}

// Index tất cả sách (đồng bộ lần đầu)
async function reindexAll() {
  const { supabase } = require('../config/database');
  const { data } = await supabase.from('bib_items').select('*');
  for (const book of data) await indexBook(book);
  console.log(`Indexed ${data.length} books`);
}

// Search
async function search(query, { type = 'all', page = 1, limit = 20, language, yearFrom, yearTo }) {
  const from = (page - 1) * limit;
  const must = [];
  
  if (type === 'all') {
    must.push({ multi_match: { query, fields: ['title^3', 'author_main^2', 'subjects', 'summary'] } });
  } else if (type === 'title') {
    must.push({ match: { title: { query, boost: 3 } } });
  } else if (type === 'author') {
    must.push({ match: { author_main: query } });
  } else if (type === 'subject') {
    must.push({ match: { subjects: query } });
  }

  // Filters
  const filter = [];
  if (language) filter.push({ term: { language_code: language } });
  if (yearFrom || yearTo) {
    filter.push({ range: { publish_year: { gte: yearFrom || 0, lte: yearTo || 9999 } } });
  }

  const body = {
    query: { bool: { must, filter } },
    from, size: limit,
    highlight: {
      fields: { title: {}, summary: {} },
      pre_tags: ['<mark>'], post_tags: ['</mark>']
    },
    suggest: {
      title_suggest: {
        text: query,
        term: { field: 'title', suggest_mode: 'popular', min_word_length: 2 }
      }
    }
  };

  const result = await client.search({ index: 'bib_items', body });
  
  return {
    total: result.hits.total.value,
    page, limit,
    results: result.hits.hits.map(h => ({
      ...h._source,
      highlight: h.highlight
    })),
    suggestions: result.suggest?.title_suggest?.[0]?.options?.map(o => o.text) || []
  };
}

module.exports = { createIndex, indexBook, reindexAll, search, client };
```

#### 1.1.3. Cập nhật OPAC Service (Ngày 2-3)

```javascript
// backend/src/modules/opac/services/opacService.js

// Thay thế basicSearch() dùng pool.query → dùng elasticsearch.search()
async function basicSearch(query, type = 'all', page = 1, limit = 20) {
  try {
    const result = await elasticsearch.search(query, { type, page, limit });
    return result;
  } catch (e) {
    // Fallback về PostgreSQL nếu ES lỗi
    console.error('ES search failed, falling back to DB:', e.message);
    return await dbBasicSearch(query, type, page, limit);
  }
}
```

#### 1.1.4. Giao diện tìm kiếm nâng cao (Ngày 3-4)

```
apps/reader/src/pages/
└── AdvancedSearchPage.tsx    ← Mới
    ├── Form: title, author, subject, publisher, year_from, year_to
    ├── Operator: AND / OR / NOT
    ├── Filters: language, format, shelf
    └── Results with highlighting (<mark> tags)
```

#### 1.1.5. Kiểm tra (Ngày 5)

- Index 1000+ records, test tốc độ (<200ms)
- Test Vietnamese search: "van hoa" → "Văn hóa Việt Nam"
- Test highlight: "văn hóa" → "**Văn hóa** Việt Nam"
- Test suggest: "kinh" → "Kinh tế", "Kính vạn hoa"

**Dev estimate:** 5 ngày (1 backend engineer)

---

### 1.2. SUPABASE STORAGE — Ảnh Bìa Sách (Tuần 2)

**Hiện trạng:** Tất cả `cover_url` = null

**Cần làm:**

#### 1.2.1. Tạo Bucket (Ngày 1)

```sql
-- Trong Supabase SQL Editor
-- Tạo bucket 'book-covers' (public) và 'patron-avatars' (private)
```

```javascript
// backend/src/services/storageService.js
const { supabase } = require('../config/database');

async function uploadCover(recordId, fileBuffer, mimeType) {
  const fileName = `cover_${recordId}.jpg`;
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('book-covers')
    .getPublicUrl(fileName);
  
  // Cập nhật bib_item
  await supabase.from('bib_items')
    .update({ cover_url: publicUrl })
    .eq('marc_record_id', recordId);
  
  return publicUrl;
}

module.exports = { uploadCover };
```

#### 1.2.2. API Upload Ảnh (Ngày 1)

```javascript
// catalogingRoutes.js — thêm route
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/records/:id/cover', authenticate, authorize('cataloging', 'write'), upload.single('cover'), async (req, res) => {
  try {
    const storageService = require('../../services/storageService');
    const url = await storageService.uploadCover(req.params.id, req.file.buffer, req.file.mimetype);
    return res.json({ url });
  } catch (error) {
    return res.status(500).json({ error: 'UPLOAD_FAILED', message: error.message });
  }
});
```

#### 1.2.3. Tạo ảnh bìa demo (Ngày 2)

```javascript
// backend/src/database/seed_covers.js
// Dùng picsum.photos hoặc OpenLibrary API để tạo ảnh bìa cho 25 sách
```

**Dev estimate:** 2 ngày (1 fullstack)

---

### 1.3. MOBILE APP — Build & Test (Tuần 2-3)

**Hiện trạng:** Code Flutter đã viết đầy đủ (44 file), chưa build/test

**Cần làm:**

#### 1.3.1. Cài đặt Flutter SDK & Build Android (Ngày 1-2)

```bash
# Cài Flutter
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor

# Build APK
cd mobile-app/
flutter pub get
flutter build apk --release
```

#### 1.3.2. Cấu hình Backend cho Mobile (Ngày 2)

```javascript
// backend/src/modules/patron/routes/patronRoutes.js — thêm:

// GET /api/patron/barcode-scan/:code
router.get('/barcode-scan/:code', async (req, res) => {
  const { supabase } = require('../../../config/database');
  const { data: item } = await supabase.from('items').select('*, bib_items(title, author_main, cover_url)').eq('dkcb', req.params.code).maybeSingle();
  if (!item) return res.json({ found: false });
  return res.json({ found: true, item, book: item.bib_items });
});
```

#### 1.3.3. Test trên Emulator (Ngày 3-4)

- Test login/register
- Test search with Vietnamese characters
- Test barcode scanner (mock)
- Test push notification (FCM test)
- Fix lỗi UI + crash

**Dev estimate:** 4 ngày (1 mobile dev)

---

### 1.4. ĐẶT MƯỢN ONLINE (Tuần 3)

**Hiện trạng:** Chỉ có UI tĩnh, chưa có flow hoàn chỉnh

**Cần làm:**

#### 1.4.1. Backend Holds API (Ngày 1)

```javascript
// circulationRoutes.js — thêm:

// POST /api/holds — đặt mượn sách
router.post('/holds', authenticate, async (req, res) => {
  const { itemId, patronId, holdDate } = req.body;
  const { supabase } = require('../../../config/database');
  
  // Kiểm tra sách có sẵn không
  const { data: item } = await supabase.from('items').select('status').eq('id', itemId).single();
  if (!item || item.status !== 'available') {
    return res.status(400).json({ error: 'NOT_AVAILABLE', message: 'Sách không có sẵn.' });
  }
  
  const { data, error } = await supabase.from('holds').insert({
    item_id: itemId,
    patron_id: patronId,
    hold_date: holdDate || new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'pending'
  }).select().single();
  
  if (error) return res.status(500).json({ error: 'DB_ERROR', message: error.message });
  
  // Gửi thông báo
  await supabase.from('notifications').insert({
    patron_id: patronId,
    title: '✅ Đặt mượn thành công',
    body: 'Sách đã được đặt. Vui lòng đến nhận trong 7 ngày.',
    type: 'hold_ready',
    is_read: false,
    sent_at: new Date().toISOString()
  });
  
  return res.json({ id: data.id, message: 'Đặt mượn thành công.' });
});
```

#### 1.4.2. Frontend Giỏ Mượn (Ngày 2-3)

```
apps/reader/src/pages/
└── BorrowPage.tsx            ← Mới
    ├── Cart list (sách đã chọn)
    ├── Ngày hẹn nhận
    ├── Xác nhận → API call
    └── Success modal
```

**Dev estimate:** 3 ngày (1 fullstack)

---

### 1.5. NEWS API + QUẢN LÝ TIN TỨC (Tuần 4)

**Hiện trạng:** Tin tức hardcoded trong frontend

**Cần làm:**

#### 1.5.1. Backend News CRUD (Ngày 1)

```javascript
// backend/src/modules/admin/routes/adminRoutes.js — thêm:

// GET /api/news — public
router.get('/news', async (req, res) => {
  const { supabase } = require('../../../config/database');
  const { data } = await supabase.from('news')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);
  return res.json(data || []);
});

// POST /api/admin/news — admin only
router.post('/news', authenticate, authorize('admin', 'write'), async (req, res) => {
  const { title, content, imageUrl, type, startDate, endDate } = req.body;
  const { supabase } = require('../../../config/database');
  const { data } = await supabase.from('news').insert({
    title, content, image_url: imageUrl, type,
    start_date: startDate, end_date: endDate,
    status: 'published', created_by: req.user.id
  }).select().single();
  return res.json(data);
});
```

#### 1.5.2. Frontend Admin News Management (Ngày 2)

```
apps/admin/src/pages/
└── NewsManagementPage.tsx    ← Mới
    ├── Table list
    ├── Add/Edit Modal
    └── Publish/Unpublish toggle
```

#### 1.5.3. Cập nhật Reader NewsList (Ngày 2)

```typescript
// apps/reader/src/components/NewsList.tsx — thay hardcoded → React Query
const { data: news } = useQuery({
  queryKey: ['news'],
  queryFn: () => apiClient.get('/news').then(r => r.data)
});
```

**Dev estimate:** 3 ngày (1 fullstack)

---

### 1.6. TVQG INTEGRATION (Tuần 4)

**Hiện trạng:** Có file `config/tvqg.js` nhưng chưa implement HTTP calls

```javascript
// backend/src/config/tvqg.js — implement đầy đủ:
const axios = require('axios');

const TVQG_API = process.env.TVQG_API_URL || 'https://opac.nlv.gov.vn/api';

async function searchRecords(query) {
  try {
    const { data } = await axios.get(`${TVQG_API}/search`, {
      params: { q: query, format: 'marc' },
      timeout: 10000
    });
    return data;
  } catch (e) {
    console.error('TVQG API error:', e.message);
    return { results: [] };
  }
}

async function importRecord(tvqgId, userId) {
  // Gọi TVQG API để lấy chi tiết biểu ghi
  const { data } = await axios.get(`${TVQG_API}/records/${tvqgId}`);
  // Parse MARC21 → lưu vào DB
  const catalogingService = require('../modules/cataloging/services/catalogingService');
  return await catalogingService.createRecord({ fields: data.fields }, userId);
}

module.exports = { searchRecords, importRecord };
```

**Dev estimate:** 2 ngày (1 backend dev)

---

## 🟡 GIAI ĐOẠN 2: NGHIỆP VỤ CHUYÊN SÂU (Tuần 5-8, 4 devs)

### Mục tiêu: 8 bước TNTT, In ấn/RFID, Elasticsearch nâng cao, Cache

---

### 2.1. HOÀN THIỆN 8 BƯỚC XỬ LÝ TNTT (Tuần 5-6)

**Hiện trạng:** B01-B04 có code, B05-B08 chưa có

#### Backend Modules mới:

```
backend/src/modules/
├── acquisition/           ← B01: Tiếp nhận (đã có một phần)
├── preprocessing/         ← B02: Xử lý sơ bộ (MỚI)
├── classification/        ← B03: Định ký hiệu (MỚI)
├── cataloging/            ← B04: Biên mục (đã có)
├── printing/              ← B05: In ấn, dán nhãn (MỚI)
├── cover-image/           ← B06: Tải ảnh bìa (MỚI)
├── quality-control/       ← B07: Kiểm tra, xếp giá (MỚI)
└── handover/              ← B08: Bàn giao (MỚI)
```

#### B05: In ấn, dán nhãn (Ngày 1-2)

```javascript
// backend/src/modules/printing/services/printingService.js

async function generateLabels(dkcbFrom, dkcbTo, options = {}) {
  // Tạo mã vạch dạng Code128 hoặc QR
  // Trả về HTML/PDF để in
  // Template: nhãn Môn loại + ĐKCB (mã vạch)
}

async function printBatch(labels) {
  // Gửi đến máy in qua network printer API
}
```

```javascript
// printingRoutes.js
POST /api/printing/labels     ← Tạo nhãn (nhập dải ĐKCB)
GET  /api/printing/labels/:batch/pdf ← Download PDF để in
```

#### B06: Tải ảnh bìa (Ngày 2)

```javascript
// backend/src/modules/cover-image/services/coverService.js
// Đã có ở Giai đoạn 1 (Supabase Storage)
```

#### B07: Kiểm tra, xếp giá (Ngày 3)

```javascript
// backend/src/modules/quality-control/
POST /api/quality-control/verify/:itemId   ← Xác nhận đã kiểm tra
GET  /api/quality-control/pending           ← Danh sách chờ kiểm tra
```

#### B08: Bàn giao (Ngày 4)

```javascript
// backend/src/modules/handover/
POST /api/handover/transfer                 ← Bàn giao cho bộ phận phục vụ
GET  /api/handover/log                      ← Nhật ký bàn giao
```

**Dev estimate:** 5 ngày (1 backend + 1 frontend)

---

### 2.2. IN ẤN + RFID/SIP2 (Tuần 6-7)

**Hiện trạng:** Chưa có gì

#### 2.2.1. In nhãn Mã vạch (Ngày 1-2)

```bash
# Cài thư viện
cd backend && npm install bwip-js    # Barcode generator (Code128)
```

```javascript
// backend/src/services/barcodeService.js
const bwipjs = require('bwip-js');

async function generateBarcode(text) {
  return await bwipjs.toBuffer({
    bcid: 'code128',
    text: text,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center'
  });
}

async function generateLabelSheet(dkcbList, shelfSection) {
  // Tạo sheet A4: 3 cột x 8 hàng = 24 nhãn
  const labels = await Promise.all(dkcbList.map(async (dkcb, i) => {
    const barcode = await generateBarcode(dkcb);
    return {
      dkcb,
      barcode: barcode.toString('base64'),
      section: shelfSection,
    };
  }));
  return labels;
}
```

#### 2.2.2. SIP2 Protocol (Ngày 3-5)

```javascript
// backend/src/services/sip2Service.js
const net = require('net');

class SIP2Server {
  constructor(port = 6001) {
    this.server = net.createServer((socket) => {
      socket.on('data', (data) => this.handleMessage(data, socket));
    });
  }

  handleMessage(data, socket) {
    const message = data.toString().trim();
    // SIP2 Protocol messages:
    // 93 = Login
    // 11 = Checkout
    // 09 = Checkin
    // 63 = Patron Info
    // 17 = Item Info
    
    switch (message.substring(0, 2)) {
      case '93': return this.handleLogin(message, socket);
      case '11': return this.handleCheckout(message, socket);
      case '09': return this.handleCheckin(message, socket);
      case '63': return this.handlePatronInfo(message, socket);
      default: socket.write('96'); // Not supported
    }
  }

  start() { this.server.listen(6001); }
}

module.exports = new SIP2Server();
```

**Dev estimate:** 5 ngày (1 backend + hardware testing)

---

### 2.3. REDIS CACHE (Tuần 7)

```bash
# docker-compose.yml — thêm
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
```

```bash
# Backend
cd backend && npm install ioredis
```

```javascript
// backend/src/services/cacheService.js
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });

const CACHE_TTL = 300; // 5 phút

async function getOrSet(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Cache patterns:
// newest_books → key="opac:newest:8", TTL=300s
// search:{q}:{type} → key="opac:search:van:all", TTL=600s
// dashboard_stats → key="admin:dashboard", TTL=120s
// popular_keywords → key="admin:keywords", TTL=3600s

module.exports = { getOrSet, redis, CACHE_TTL };
```

**Dev estimate:** 2 ngày (1 backend dev)

---

### 2.4. PHÂN QUYỀN UI + AUDIT LOG (Tuần 8)

#### 2.4.1. Trang Quản lý Phân quyền (Ngày 1-2)

```
apps/admin/src/pages/
└── RoleManagementPage.tsx   ← Mới
    ├── Bảng: Role | Module | Read | Write | Delete
    ├── Matrix view (như bảng yêu cầu)
    └── Gán/Bỏ quyền bằng checkbox
```

#### 2.4.2. Audit Log Viewer (Ngày 2-3)

```
apps/admin/src/pages/
└── AuditLogPage.tsx         ← Mới
    ├── Table: Thời gian | User | Hành động | Module | Entity | IP
    ├── Filter: date range, user, module
    └── Chi tiết: old_value → new_value
```

#### 2.4.3. Dashboard Thủ thư riêng (Ngày 3-4)

```javascript
// backend/src/modules/librarian/ (nếu chưa có, thêm)
// backend/src/modules/admin/routes/adminRoutes.js — thêm:

// GET /api/librarian/dashboard
router.get('/librarian/dashboard', authenticate, async (req, res) => {
  const { supabase } = require('../../../config/database');
  
  // Sách chờ xử lý
  const { count: pendingProcessing } = await supabase.from('items').select('*', { count: 'exact', head: true }).is('bib_id', null);
  
  // Sách chờ biên mục  
  const { count: pendingCataloging } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'pending_catalog');
  
  // Giao dịch hôm nay
  const today = new Date().toISOString().split('T')[0];
  const { count: todayTx } = await supabase.from('circulation').select('*', { count: 'exact', head: true }).gte('checkout_date', today);
  
  // Quá hạn
  const { count: overdue } = await supabase.from('circulation').select('*', { count: 'exact', head: true }).eq('status', 'active').lt('due_date', today);
  
  return res.json({ pendingProcessing, pendingCataloging, todayTransactions: todayTx, overdueItems: overdue });
});
```

**Dev estimate:** 4 ngày (1 fullstack)

---

## 🔴 GIAI ĐOẠN 3: HOÀN THIỆN + VẬN HÀNH (Tuần 9-12, 3 devs)

### Mục tiêu: Báo cáo còn thiếu, Danh mục chuẩn, Docker, CI/CD, Quên MK

---

### 3.1. BÁO CÁO CÒN THIẾU (Tuần 9)

#### Backend APIs mới:

```javascript
// adminRoutes.js — thêm:

// GET /api/admin/reports/patrons?from=&to=
router.get('/reports/patrons', authenticate, authorize('report', 'read'), async (req, res) => {
  const { from, to } = req.query;
  const { supabase } = require('../../../config/database');
  const { count: newPatrons } = await supabase.from('patrons').select('*', { count: 'exact', head: true }).gte('created_at', from).lte('created_at', to);
  const { count: active } = await supabase.from('patrons').select('*', { count: 'exact', head: true }).eq('status', 'active');
  return res.json({ newPatrons, active, total: active });
});

// GET /api/admin/reports/inventory → dùng inventory_sessions + inventory_details
// GET /api/admin/reports/withdrawn  → items.status = 'discarded'
// GET /api/admin/reports/cataloging-stats → group by created_by trong marc_records
```

**Dev estimate:** 3 ngày (1 backend + 1 frontend)

---

### 3.2. DANH MỤC CHUẨN ĐẦY ĐỦ (Tuần 9-10)

#### 3.2.1. Bảng DDC 23 (Ngày 1)

```sql
-- backend/src/database/migrations/002_ddc_table.sql
CREATE TABLE ddc_classification (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10),           -- 000, 100, 200... 330, 332, 332.6
  name VARCHAR(200),          -- Tin học, Triết học, Kinh tế...
  parent_code VARCHAR(10),
  level INT DEFAULT 1
);

-- Seed data: ~100 mục DDC chính
INSERT INTO ddc_classification VALUES
  (1,'000','Tổng quát',NULL,1),
  (2,'100','Triết học & Tâm lý học',NULL,1),
  ...
  (15,'332.6','Đầu tư','332',3);
```

#### 3.2.2. Bổ sung Mã ngôn ngữ đủ 60 (Ngày 1)

```sql
-- Thêm INSERT vào language_codes
INSERT INTO language_codes (code, name) VALUES
  ('spa','Tiếng Tây Ban Nha'),('por','Tiếng Bồ Đào Nha'),
  ('ita','Tiếng Ý'),('ara','Tiếng Ả Rập'),
  ('hin','Tiếng Hindi'),('tha','Tiếng Thái'),
  ... -- đủ ~60 mã
```

#### 3.2.3. Bộ từ khóa TVQG (Ngày 2)

```sql
-- Import từ file/keywords.csv
-- Seed thêm keywords với type: personal, corporate, subject, geographic, genre
```

#### 3.2.4. UI Quản lý Danh mục (Ngày 2-3)

- Sửa StandardsPage thêm tab DDC
- Cho phép thêm/sửa/xóa DDC classification
- Cho phép thêm/sửa ngôn ngữ, từ khóa

**Dev estimate:** 3 ngày (1 fullstack)

---

### 3.3. QUÊN MẬT KHẨU + EMAIL (Tuần 10)

```javascript
// authRoutes.js — thêm:

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const { supabase } = require('../../../config/database');
  const { data: user } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
  if (!user) return res.json({ message: 'Nếu email tồn tại, link đặt lại MK đã được gửi.' });
  
  const token = jwt.sign({ userId: user.id, type: 'reset' }, config.jwt.resetSecret, { expiresIn: '1h' });
  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
  
  // Gửi email (dùng nodemailer)
  await sendEmail(email, 'Đặt lại mật khẩu - Thư viện Yongin', `Nhấp vào link để đặt lại: ${resetLink}`);
  
  return res.json({ message: 'Link đặt lại mật khẩu đã được gửi.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const decoded = jwt.verify(token, config.jwt.resetSecret);
  const hash = await bcrypt.hash(newPassword, 10);
  await supabase.from('users').update({ password_hash: hash }).eq('id', decoded.userId);
  return res.json({ message: 'Mật khẩu đã được đặt lại.' });
});
```

```bash
cd backend && npm install nodemailer
```

```
apps/reader/src/pages/
└── ForgotPasswordPage.tsx   ← Mới
└── ResetPasswordPage.tsx    ← Mới
```

**Dev estimate:** 2 ngày (1 fullstack)

---

### 3.4. DOCKER + CI/CD (Tuần 11)

#### 3.4.1. Docker Compose (Ngày 1-2)

```yaml
# docker-compose.yml — hoàn chỉnh cho toàn bộ hệ thống
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ['3000:3000']
    env_file: ./backend/.env
    depends_on: [elasticsearch, redis]
    volumes: ['./backend/src:/app/src']
  
  elasticsearch:
    image: elasticsearch:8.15.0
    environment: [discovery.type=single-node, xpack.security.enabled=false]
    ports: ['9200:9200']
  
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
  
  nginx:
    image: nginx:alpine
    ports: ['80:80']
    volumes: ['./infra/nginx/nginx.conf:/etc/nginx/nginx.conf']
    depends_on: [backend]

# docker-compose build && docker-compose up -d
```

#### 3.4.2. GitHub Actions CI/CD (Ngày 3)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd backend && npm ci && npm test
      - run: cd frontend && npm ci && npm run build
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          script: |
            cd /app/thu-vien-yongin
            git pull
            docker-compose up -d --build
```

#### 3.4.3. Nginx Config (Ngày 3)

```nginx
# infra/nginx/nginx.conf
server {
  listen 80;
  server_name thuvienyongin.vn;
  
  location /api {
    proxy_pass http://backend:3000;
  }
  
  location /librarian {
    alias /app/frontend/apps/librarian/dist;
    try_files $uri /librarian/index.html;
  }
  
  location /admin {
    alias /app/frontend/apps/admin/dist;
    try_files $uri /admin/index.html;
  }
  
  location / {
    alias /app/frontend/apps/reader/dist;
    try_files $uri /index.html;
  }
}
```

**Dev estimate:** 3 ngày (1 DevOps)

---

### 3.5. TESTING + BUG FIXES (Tuần 12)

#### Checklist:

- [ ] Test Elasticsearch search với 1000+ records (<200ms)
- [ ] Test Redis cache hit/miss
- [ ] Test upload ảnh bìa → hiển thị trên OPAC
- [ ] Test đặt mượn online → checkout → thông báo
- [ ] Test 8 bước TNTT end-to-end
- [ ] Test in nhãn mã vạch → PDF output
- [ ] Test quên mật khẩu → email → reset
- [ ] Test phân quyền: biên mục viên không được xem admin
- [ ] Test mobile app trên Android thật
- [ ] Test Docker compose up → app chạy
- [ ] Test responsive trên mobile/tablet
- [ ] Fix lỗi encoding tiếng Việt (Unicode)
- [ ] Performance test: 1000 concurrent searches

**Dev estimate:** 5 ngày (cả team)

---

## 📅 LỊCH TRÌNH TỔNG THỂ

```
TUẦN  | GIAI ĐOẠN | NỘI DUNG                              | DEVS
───────┼───────────┼───────────────────────────────────────┼─────
1      | GĐ1       | Elasticsearch: cài đặt + index + API  | 1 BE
2      | GĐ1       | ES nâng cao + Storage ảnh bìa         | 1 BE + 1 FS
3      | GĐ1       | Mobile build + Đặt mượn online        | 1 Mobile + 1 FS
4      | GĐ1       | News API + TVQG integration            | 1 FS + 1 BE
───────┼───────────┼───────────────────────────────────────┼─────
5-6    | GĐ2       | 8 bước TNTT (B05-B08)                 | 1 BE + 1 FE
6-7    | GĐ2       | In ấn + RFID/SIP2                     | 1 BE + hardware
7      | GĐ2       | Redis cache                            | 1 BE
8      | GĐ2       | Phân quyền UI + Audit log + Dashboard   | 1 FS
───────┼───────────┼───────────────────────────────────────┼─────
9      | GĐ3       | Báo cáo còn thiếu (4 reports)         | 1 BE + 1 FE
9-10   | GĐ3       | Danh mục chuẩn (DDC, ngôn ngữ, keywords)| 1 FS
10     | GĐ3       | Quên mật khẩu + email                  | 1 FS
11     | GĐ3       | Docker + CI/CD + Nginx                 | 1 DevOps
12     | GĐ3       | Testing + Bug fixes                    | Cả team
```

## 👥 NHÂN SỰ

| Vai trò | Số lượng | Phụ trách |
|---------|----------|-----------|
| Backend Node.js | 2 | Elasticsearch, Redis, SIP2, Reports, TVQG |
| Frontend React | 2 | News, Đặt mượn, Phân quyền UI, Danh mục |
| Mobile Flutter | 1 | Build + test app |
| DevOps | 1 | Docker, CI/CD, Nginx (part-time) |

**Tổng:** ~5 devs x 12 tuần = ~240 ngày công

## 💰 CHI PHÍ

| Giai đoạn | Ngày công | Chi phí (ước tính) |
|-----------|-----------|-------------------|
| GĐ1 (Tuần 1-4) | ~80 ngày | ~160 triệu |
| GĐ2 (Tuần 5-8) | ~80 ngày | ~160 triệu |
| GĐ3 (Tuần 9-12) | ~60 ngày | ~120 triệu |
| Hạ tầng (server) | — | ~20 triệu |
| **Tổng** | **~220 ngày** | **~460 triệu** |

---

## 📊 SAU KHI HOÀN THIỆN

| Chỉ tiêu | Trước | Sau |
|----------|-------|-----|
| Mức độ hoàn thiện | 65% | 95% |
| Tìm kiếm | PostgreSQL ILIKE | Elasticsearch full-text |
| Tốc độ search (>10k records) | >2s | <200ms |
| Ảnh bìa sách | 0/27 | 27/27 |
| 8 bước TNTT | 3/8 | 8/8 |
| Mobile app | Code chưa build | APK trên Play Store |
| Cache | Không có | Redis 5 phút |
| Deploy | Thủ công | Docker tự động |
| Báo cáo | 4/11 loại | 11/11 |
| Ngôn ngữ hỗ trợ | 5 | 60 |
