# 🛠️ KẾ HOẠCH SỬA LỖI — CỔNG THỦ THƯ

> 3 lỗi backend + 5 cải tiến giao diện — 2 ngày

---

## 🔴 LỖI 1: Patron Search không hoạt động

**Hiện trạng:** `GET /api/patron/search?q=Nguyen` → trả về rỗng

**Nguyên nhân:** Route gọi `patronService.search()` trong `patronService.js`. File này là bản mới (Supabase) nhưng hàm `search()` vẫn dùng `pool.query()` cũ cần `exec_sql`.

**Fix:**

```javascript
// patronService.js — sửa hàm search():
async function search(query, page = 1, limit = 20) {
  const sq = normalizeSearch(query);
  const offset = (page - 1) * limit;

  // Dùng supabase.from() thay vì pool.query()
  const { data, count } = await supabase
    .from('patrons')
    .select('*', { count: 'exact' })
    .or(`full_name.ilike.%${sq}%,card_barcode.ilike.%${sq}%,email.ilike.%${sq}%`)
    .range(offset, offset + limit - 1)
    .order('full_name');

  return {
    total: count || 0,
    page, limit,
    totalPages: Math.ceil((count || 0) / limit),
    results: data || [],
  };
}
```

**Effort:** 15 phút (sửa 1 hàm)

---

## 🔴 LỖI 2: Collection Sections lỗi

**Hiện trạng:** `GET /api/collection/sections` → INTERNAL_ERROR

**Nguyên nhân:** `collectionService.js` dùng `pool.query()` cũ.

**Fix:** Viết lại toàn bộ collectionService.js dùng `supabase.from()`

```javascript
// collectionService.js — các hàm cần sửa:

// 1. getSections()
async function getSections() {
  const { data } = await supabase
    .from('shelf_locations')
    .select('section')
    .eq('status', 'active')
    .order('section');
  return [...new Set((data || []).map(r => r.section))];
}

// 2. getItems() — query items + join bib_items
async function getItems(shelf, status, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  let query = supabase
    .from('items')
    .select('*, bib_items(title, author_main)', { count: 'exact' });

  if (shelf) query = query.eq('shelf_section', shelf);
  if (status) query = query.eq('status', status);

  const { data, count } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  return { total: count || 0, page, limit, results: data || [] };
}

// 3. transferItem() — chuyển kho
async function transferItem(dkcb, toSection, reason, userId) {
  const { data: item } = await supabase.from('items').select('id').eq('dkcb', dkcb).maybeSingle();
  if (!item) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu.' };

  await supabase.from('items').update({
    shelf_section: toSection,
    updated_at: new Date().toISOString()
  }).eq('id', item.id);

  // Ghi log
  await supabase.from('audit_logs').insert({
    user_id: userId, action: 'TRANSFER', module: 'collection',
    entity_type: 'item', entity_id: item.id,
    new_value: JSON.stringify({ shelf_section: toSection, reason }),
  });

  return { message: 'Đã chuyển kho thành công.' };
}

// 4. discardItem()
async function discardItem(dkcb, reason, userId) {
  const { data: item } = await supabase.from('items').select('id').eq('dkcb', dkcb).maybeSingle();
  if (!item) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy.' };

  await supabase.from('items').update({
    status: 'discarded', discarded_date: new Date().toISOString().split('T')[0],
    notes: reason, updated_at: new Date().toISOString()
  }).eq('id', item.id);

  await supabase.from('audit_logs').insert({
    user_id: userId, action: 'DISCARD', module: 'collection',
    entity_type: 'item', entity_id: item.id, new_value: JSON.stringify({ reason }),
  });

  return { message: 'Đã thanh lý.' };
}

// 5. startInventory() + inventoryScan() + completeInventory()
// Tương tự: supabase.from('inventory_sessions').insert(...)
//  supabase.from('inventory_details').insert(...)
```

**Effort:** 2 giờ (viết lại toàn bộ service ~200 dòng)

---

## 🔴 LỖI 3: Patron Checkouts không có route

**Hiện trạng:** `GET /api/circulation/patron/:id/checkouts` → 404

**Nguyên nhân:** Route này nằm ở circulationRoutes.js (cần mount) hoặc chưa được thêm.

**Fix:** Thêm route vào patronRoutes.js hoặc circulationRoutes.js

```javascript
// patronRoutes.js — thêm:
/**
 * GET /api/patron/:id/checkouts
 * Sách đang mượn
 */
router.get('/:id/checkouts', authenticate, async (req, res) => {
  try {
    const { data } = await supabase
      .from('circulation')
      .select('*, items(dkcb, bib_items(title, author_main))')
      .eq('patron_id', req.params.id)
      .eq('status', 'active')
      .order('checkout_date', { ascending: false });

    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/history
 * Lịch sử mượn/trả
 */
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, count } = await supabase
      .from('circulation')
      .select('*, items(dkcb, bib_items(title, author_main))', { count: 'exact' })
      .eq('patron_id', req.params.id)
      .order('checkout_date', { ascending: false })
      .range(offset, offset + limit - 1);

    return res.json({ total: count, page, limit, data: data || [] });
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});
```

**Effort:** 30 phút

---

## 🟡 CẢI TIẾN: 5 nâng cấp giao diện

| # | Cải tiến | Mô tả | File | Effort |
|---|----------|-------|------|--------|
| 4 | **Skeleton loading** | Hiển thị skeleton khi API loading thay vì trắng trơn | Các page component | 1 giờ |
| 5 | **Thêm 10 trường MARC21** | Bổ sung 246, 250, 300, 490, 520, 610, 651, 653, 700, 910 | `CatalogingPage.tsx` | 2 giờ |
| 6 | **Preview biểu ghi** | Nút "Xem trước MARC21" hiển thị modal form biểu ghi | `CatalogingPage.tsx` | 2 giờ |
| 7 | **Auto-complete tác giả** | Gợi ý tác giả từ CSDL khi gõ | `CatalogingPage.tsx` | 1 giờ |
| 8 | **In phiếu mượn** | Nút in phiếu xác nhận mượn/trả | `CirculationCheckout.tsx` | 1 giờ |

---

## 📅 LỊCH TRÌNH

```
Ngày  | Công việc              | Người | Thời gian
──────┼───────────────────────────────────────────
Sáng  | Fix patron search       | Backend | 15 phút
Sáng  | Fix collection sections | Backend | 2 giờ
Sáng  | Fix patron routes       | Backend | 30 phút
Chiều | Skeleton loading        | Frontend | 1 giờ
Chiều | Thêm trường MARC21     | Frontend | 2 giờ
Tối   | Preview + Auto-complete | Frontend | 3 giờ
Tối   | In phiếu + Kiểm tra   | Cả hai   | 2 giờ
```

**Tổng:** ~11 giờ (1.5 ngày với 1 fullstack)
