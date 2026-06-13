require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function randDate(startDays, rangeDays) {
  const d = new Date(Date.now() - startDays * 86400000 + Math.random() * rangeDays * 86400000);
  return d.toISOString().split('T')[0];
}

async function main() {
  const HASH = await bcrypt.hash('reader123', 10);

  // 1. Seed 30 more patrons (total ~40)
  const extraNames = [
    'Phạm Văn Tài', 'Lê Nhật Khoa', 'Nguyễn Thị Thu Hương', 'Võ Văn Lợi',
    'Trần Hoài Nam', 'Nguyễn Hoàng Dũng', 'Lê Tiến Anh', 'Đặng Thái Sơn',
    'Phan Tuấn Anh', 'Hồ Trọng Nghĩa', 'Lâm Hồng Kông', 'Trịnh Minh Châu',
    'Ngô Đình Quốc', 'Mai Hữu Thắng', 'Quách Công Lý', 'Dương Thế Vinh',
    'Hà Xuân Trường', 'Bùi Tân Long', 'Đỗ Hoàng Yến', 'Vũ Minh Tuấn',
    'Đặng Quốc Hùng', 'Bùi Hữu Tùng', 'Đỗ Công Hải', 'Ngô Mỹ Lan',
    'Dương Kim Sơn', 'Hồ Tiến Thành', 'Trương Anh Tú', 'Vũ Bích Ngọc',
    'Lâm Ngọc Hân', 'Hoàng Xuân Lộc',
  ];

  for (const name of extraNames) {
    await supabase.from('patrons').insert({
      card_barcode: `TV3${String(100000 + Math.floor(Math.random() * 900000)).slice(0, 6)}`,
      full_name: name, patron_type: Math.random() > 0.3 ? 'adult' : 'child',
      max_checkouts: 5, max_days: 30, fee_per_day: 5000, status: 'active',
      password_hash: HASH,
      email: name.toLowerCase().replace(/ /g, '') + '@email.com',
      created_at: randDate(360, 180) + 'T00:00:00Z',
    }).maybeSingle();
  }
  console.log(`✅ Added ${extraNames.length} patrons`);

  // 2. Get all bib IDs and patron IDs
  const { data: bibs } = await supabase.from('bib_items').select('id');
  const { data: pats } = await supabase.from('patrons').select('id');
  if (!bibs || !pats) return;
  console.log(`📚 ${bibs.length} books, 👤 ${pats.length} patrons`);

  // 3. Seed 50+ more items
  let itemCount = 0;
  for (const bib of bibs) {
    const copies = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < copies; c++) {
      const idx = bib.id * 10 + c;
      const { error } = await supabase.from('items').insert({
        bib_id: bib.id,
        dkcb: `M.${String(50000 + idx)}`,
        barcode: `BAR${50000 + idx}`,
        format: 'book',
        shelf_section: ['Kho Mượn', 'Kho Đọc', 'Kho Người lớn', 'Kho Thiếu nhi'][idx % 4],
        status: Math.random() > 0.15 ? 'available' : 'checked_out',
        price: Math.floor(Math.random() * 200000 + 50000),
        acquired_date: randDate(365, 180),
      }).maybeSingle();
      if (!error) itemCount++;
    }
  }
  console.log(`✅ Added ${itemCount} items`);

  // 4. Seed 200 circulation records
  let circCount = 0;
  for (let i = 0; i < 200; i++) {
    const bib = bibs[i % bibs.length];
    const pat = pats[i % pats.length];
    const { data: item } = await supabase.from('items').select('id').eq('bib_id', bib.id).limit(1).maybeSingle();
    if (!item) continue;

    const cd = randDate(90, 60);
    const dd = new Date(new Date(cd).getTime() + 30 * 86400000).toISOString().split('T')[0];
    const isReturned = Math.random() > 0.25;
    const cid = randDate(20, 10);

    await supabase.from('circulation').insert({
      item_id: item.id, patron_id: pat.id,
      checkout_date: cd, due_date: dd,
      checkin_date: isReturned ? cid : null,
      status: isReturned ? 'returned' : 'active',
      fee_amount: 0, fee_paid: true,
      checkout_by: 1,
      created_at: cd + 'T00:00:00Z',
    }).maybeSingle();
    circCount++;
  }
  console.log(`✅ Added ${circCount} circulation records`);

  // 5. Seed 50 reviews
  let revCount = 0;
  for (let i = 0; i < 50; i++) {
    const bib = bibs[i % bibs.length];
    const pat = pats[i % pats.length];
    const rating = Math.floor(Math.random() * 3) + 3;
    await supabase.from('reviews').insert({
      patron_id: pat.id, bib_id: bib.id,
      rating,
      comment: ['Rất hay!', 'Sách bổ ích', 'Nên đọc', 'Tuyệt vời', 'Có thể tham khảo', 'Nội dung sâu sắc', 'Đáng đọc nhất năm'][Math.floor(Math.random() * 7)],
    }).maybeSingle();
    revCount++;
  }
  console.log(`✅ Added ${revCount} reviews`);

  // 6. Seed 30 notifications
  let notifCount = 0;
  for (let i = 0; i < 30; i++) {
    const pat = pats[i % pats.length];
    await supabase.from('notifications').insert({
      patron_id: pat.id,
      title: ['Sắp đến hạn trả', 'Sách mới về', 'Cảm ơn đã trả sách', 'Đặt mượn thành công'][Math.floor(Math.random() * 4)],
      body: `Thông báo cho bạn đọc ${pat.id}. Vui lòng kiểm tra.`,
      type: ['reminder', 'new_book', 'returned', 'hold_ready'][Math.floor(Math.random() * 4)],
      is_read: Math.random() > 0.5,
      sent_at: randDate(30, 30) + 'T00:00:00Z',
    }).maybeSingle();
    notifCount++;
  }
  console.log(`✅ Added ${notifCount} notifications`);

  console.log(`\n🎉 DONE! ${bibs.length} books, ${itemCount} items, ${pats.length} patrons, ${circCount} circ, ${revCount} reviews, ${notifCount} notifs`);
}

main().catch(console.error);
