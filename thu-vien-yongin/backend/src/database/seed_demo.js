/**
 * Seed dữ liệu mẫu — Tạo dữ liệu giả để kiểm tra toàn bộ hệ thống
 * 
 * Chạy: node src/database/seed_demo.js
 */
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ═══════════════════════════════════════════════════
// DỮ LIỆU MẪU
// ═══════════════════════════════════════════════════

const BOOKS = [
  { title: 'Văn hóa Việt Nam', author: 'Trần Quốc Vượng', year: 2023, isbn: '9786047767298', publisher: 'NXB Văn hóa', pages: '456 tr.', size: '24 cm', subject: 'Văn hóa', lang: 'vie', copies: 3 },
  { title: 'Cơ sở văn hóa Việt Nam', author: 'Trần Ngọc Thêm', year: 2022, isbn: '9786045834567', publisher: 'NXB Giáo dục', pages: '320 tr.', size: '21 cm', subject: 'Văn hóa', lang: 'vie', copies: 2 },
  { title: 'Tìm hiểu về RFID trong thư viện', author: 'Nguyễn Văn A', year: 2024, isbn: '9786047712345', publisher: 'NXB Thông tin', pages: '180 tr.', size: '19 cm', subject: 'Công nghệ', lang: 'vie', copies: 2 },
  { title: 'Lịch sử Việt Nam', author: 'Phan Huy Lê', year: 2021, isbn: '9786047723456', publisher: 'NXB Đại học Quốc gia', pages: '780 tr.', size: '27 cm', subject: 'Lịch sử', lang: 'vie', copies: 1 },
  { title: 'Đại số tuyến tính', author: 'Nguyễn Hữu Việt Hưng', year: 2023, isbn: '9786047734567', publisher: 'NXB Đại học Quốc gia', pages: '420 tr.', size: '24 cm', subject: 'Toán học', lang: 'vie', copies: 2 },
  { title: 'Giải tích 1', author: 'Trần Đức Long', year: 2022, isbn: '9786047745678', publisher: 'NXB Khoa học', pages: '380 tr.', size: '24 cm', subject: 'Toán học', lang: 'vie', copies: 3 },
  { title: 'Vật lý đại cương', author: 'Lương Duyên Bình', year: 2023, isbn: '9786047756789', publisher: 'NXB Khoa học', pages: '520 tr.', size: '27 cm', subject: 'Vật lý', lang: 'vie', copies: 2 },
  { title: 'Hóa học hữu cơ', author: 'Nguyễn Đình Triệu', year: 2022, isbn: '9786047767890', publisher: 'NXB Y học', pages: '650 tr.', size: '27 cm', subject: 'Hóa học', lang: 'vie', copies: 1 },
  { title: 'Sinh học phân tử', author: 'Phạm Hoàng Hộ', year: 2024, isbn: '9786047778901', publisher: 'NXB Khoa học', pages: '480 tr.', size: '24 cm', subject: 'Sinh học', lang: 'vie', copies: 2 },
  { title: 'Kinh tế học vi mô', author: 'David Begg', year: 2023, isbn: '9786047789012', publisher: 'NXB Kinh tế', pages: '550 tr.', size: '24 cm', subject: 'Kinh tế', lang: 'vie', copies: 2 },
  { title: 'Kinh tế học vĩ mô', author: 'Paul Krugman', year: 2022, isbn: '9786047790123', publisher: 'NXB Kinh tế', pages: '600 tr.', size: '27 cm', subject: 'Kinh tế', lang: 'vie', copies: 1 },
  { title: 'Triết học Mác-Lênin', author: 'Bộ Giáo dục', year: 2021, isbn: '9786047801234', publisher: 'NXB Chính trị', pages: '350 tr.', size: '21 cm', subject: 'Triết học', lang: 'vie', copies: 3 },
  { title: 'Tư tưởng Hồ Chí Minh', author: 'Bộ Giáo dục', year: 2022, isbn: '9786047812345', publisher: 'NXB Chính trị', pages: '280 tr.', size: '21 cm', subject: 'Chính trị', lang: 'vie', copies: 2 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 2020, isbn: '9780743273565', publisher: 'Scribner', pages: '180 p.', size: '21 cm', subject: 'Văn học', lang: 'eng', copies: 1 },
  { title: '1984', author: 'George Orwell', year: 2021, isbn: '9780451524935', publisher: 'Signet', pages: '328 p.', size: '19 cm', subject: 'Văn học', lang: 'eng', copies: 2 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 2020, isbn: '9780061120084', publisher: 'HarperCollins', pages: '336 p.', size: '21 cm', subject: 'Văn học', lang: 'eng', copies: 1 },
  { title: 'Dế Mèn phiêu lưu ký', author: 'Tô Hoài', year: 2023, isbn: '9786047823456', publisher: 'NXB Kim Đồng', pages: '240 tr.', size: '19 cm', subject: 'Thiếu nhi', lang: 'vie', copies: 4 },
  { title: 'Kính vạn hoa', author: 'Nguyễn Nhật Ánh', year: 2022, isbn: '9786047834567', publisher: 'NXB Trẻ', pages: '200 tr.', size: '19 cm', subject: 'Thiếu nhi', lang: 'vie', copies: 3 },
  { title: 'Cho tôi xin một vé đi tuổi thơ', author: 'Nguyễn Nhật Ánh', year: 2023, isbn: '9786047845678', publisher: 'NXB Trẻ', pages: '200 tr.', size: '19 cm', subject: 'Thiếu nhi', lang: 'vie', copies: 2 },
  { title: 'Nhà giả kim', author: 'Paulo Coelho', year: 2022, isbn: '9786047856789', publisher: 'NXB Văn học', pages: '220 tr.', size: '21 cm', subject: 'Văn học', lang: 'vie', copies: 2 },
  { title: 'Hạt giống tâm hồn', author: 'Nhiều tác giả', year: 2023, isbn: '9786047867890', publisher: 'NXB Tổng hợp', pages: '180 tr.', size: '19 cm', subject: 'Tâm lý', lang: 'vie', copies: 3 },
  { title: 'Đắc nhân tâm', author: 'Dale Carnegie', year: 2022, isbn: '9786047878901', publisher: 'NXB Tổng hợp', pages: '320 tr.', size: '21 cm', subject: 'Tâm lý', lang: 'vie', copies: 2 },
  { title: 'Khéo ăn nói sẽ có được thiện cảm', author: 'Trác Nhã', year: 2023, isbn: '9786047889012', publisher: 'NXB Phụ nữ', pages: '260 tr.', size: '21 cm', subject: 'Tâm lý', lang: 'vie', copies: 1 },
  { title: 'Giáo trình Cấu trúc dữ liệu', author: 'Đỗ Xuân Lôi', year: 2023, isbn: '9786047890123', publisher: 'NXB Khoa học', pages: '380 tr.', size: '24 cm', subject: 'Công nghệ', lang: 'vie', copies: 2 },
  { title: 'Mạng máy tính', author: 'Trần Văn Hùng', year: 2022, isbn: '9786047901234', publisher: 'NXB Khoa học', pages: '420 tr.', size: '24 cm', subject: 'Công nghệ', lang: 'vie', copies: 2 },
];

const PATRONS = [
  { name: 'Nguyễn Văn An', cardBarcode: 'TV000001', idCard: '001202500001', phone: '0905123401', email: 'annv@example.com', type: 'adult' },
  { name: 'Trần Thị Bình', cardBarcode: 'TV000002', idCard: '001202500002', phone: '0905123402', email: 'binhtt@example.com', type: 'adult' },
  { name: 'Lê Văn Chí', cardBarcode: 'TV000003', idCard: '001202500003', phone: '0905123403', email: 'chilv@example.com', type: 'adult' },
  { name: 'Phạm Thị Dung', cardBarcode: 'TV000004', idCard: '001202500004', phone: '0905123404', email: 'dungpt@example.com', type: 'adult' },
  { name: 'Hoàng Văn Em', cardBarcode: 'TV000005', idCard: '001202500005', phone: '0905123405', email: 'emhv@example.com', type: 'child' },
  { name: 'Nguyễn Thị Phương', cardBarcode: 'TV000006', idCard: '001202500006', phone: '0905123406', email: 'phuongnt@example.com', type: 'adult' },
  { name: 'Võ Văn Giàu', cardBarcode: 'TV000007', idCard: '001202500007', phone: '0905123407', email: 'giauvv@example.com', type: 'adult' },
  { name: 'Đặng Thị Hạnh', cardBarcode: 'TV000008', idCard: '001202500008', phone: '0905123408', email: 'hanhdt@example.com', type: 'adult' },
  { name: 'Bùi Văn In', cardBarcode: 'TV000009', idCard: '001202500009', phone: '0905123409', email: 'inbv@example.com', type: 'child' },
  { name: 'Cao Thị Kim', cardBarcode: 'TV000010', idCard: '001202500010', phone: '0905123410', email: 'kimct@example.com', type: 'adult' },
];

const SECTIONS = ['Kho Mượn', 'Kho Đọc', 'Kho Thiếu nhi', 'Kho Người lớn'];

// ═══════════════════════════════════════════════════
// HÀM TIỆN ÍCH
// ═══════════════════════════════════════════════════

function randomDate(start, days) {
  const d = new Date(start);
  d.setDate(d.getDate() + Math.floor(Math.random() * days));
  return d.toISOString().split('T')[0];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeSearch(str) {
  const map = {
    'à': 'a','á': 'a','ả': 'a','ã': 'a','ạ': 'a',
    'ă': 'a','ắ': 'a','ằ': 'a','ẳ': 'a','ẵ': 'a','ặ': 'a',
    'â': 'a','ấ': 'a','ầ': 'a','ẩ': 'a','ẫ': 'a','ậ': 'a',
    'è': 'e','é': 'e','ẻ': 'e','ẽ': 'e','ẹ': 'e',
    'ê': 'e','ế': 'e','ề': 'e','ể': 'e','ễ': 'e','ệ': 'e',
    'ì': 'i','í': 'i','ỉ': 'i','ĩ': 'i','ị': 'i',
    'ò': 'o','ó': 'o','ỏ': 'o','õ': 'o','ọ': 'o',
    'ô': 'o','ố': 'o','ồ': 'o','ổ': 'o','ỗ': 'o','ộ': 'o',
    'ơ': 'o','ớ': 'o','ờ': 'o','ở': 'o','ỡ': 'o','ợ': 'o',
    'ù': 'u','ú': 'u','ủ': 'u','ũ': 'u','ụ': 'u',
    'ư': 'u','ứ': 'u','ừ': 'u','ử': 'u','ữ': 'u','ự': 'u',
    'ỳ': 'y','ý': 'y','ỷ': 'y','ỹ': 'y','ỵ': 'y',
    'đ': 'd',
    'À': 'A','Á': 'A','Ả': 'A','Ã': 'A','Ạ': 'A',
    'È': 'E','É': 'E','Ẻ': 'E','Ẽ': 'E','Ẹ': 'E',
    'Ì': 'I','Í': 'I','Ỉ': 'I','Ĩ': 'I','Ị': 'I',
    'Ò': 'O','Ó': 'O','Ỏ': 'O','Õ': 'O','Ọ': 'O',
    'Ù': 'U','Ú': 'U','Ủ': 'U','Ũ': 'U','Ụ': 'U',
    'Ỳ': 'Y','Ý': 'Y','Đ': 'D',
  };
  return str.split('').map(ch => map[ch] || ch).join('').toLowerCase().trim().replace(/\s+/g, ' ');
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

async function seed() {
  console.log('🌱 Bắt đầu seed dữ liệu mẫu...\n');
  let totalItems = 0;

  // 1. Xoá dữ liệu cũ
  console.log('⏳ Xoá dữ liệu cũ...');
  const tables = ['circulation','holds','fines','reviews','wishlist','items','bib_items','marc_subfields','marc_fields','marc_records','patrons'];
  for (const t of tables) {
    await supabase.from(t).delete().neq('id', 0);
    console.log(`  ✅ Xoá bảng ${t}`);
  }

  // 2. Seed Shelf locations
  console.log('\n⏳ Tạo shelf locations...');
  for (const s of SECTIONS) {
    await supabase.from('shelf_locations').insert({ section: s, row: 'A', position: '1', status: 'active' }).maybeSingle();
  }
  console.log(`  ✅ ${SECTIONS.length} khu vực kho`);

  // 3. Seed patrons
  console.log('\n⏳ Tạo bạn đọc...');
  for (const p of PATRONS) {
    const hash = await bcrypt.hash('reader123', 10);
    await supabase.from('patrons').insert({
      card_barcode: p.cardBarcode,
      full_name: p.name,
      id_card: p.idCard,
      phone: p.phone,
      email: p.email,
      patron_type: p.type,
      max_checkouts: 5,
      max_days: 30,
      fee_per_day: 5000,
      status: 'active',
      password_hash: hash,
      created_at: randomDate('2026-01-01', 120) + 'T00:00:00Z',
    });
  }
  console.log(`  ✅ ${PATRONS.length} bạn đọc (mật khẩu: reader123)`);

  // 4. Seed books
  console.log('\n⏳ Tạo tài liệu...');
  for (const book of BOOKS) {
    // Marc record
    const leader = '00869cam 2200265 a 4500';
    const { data: record } = await supabase.from('marc_records').insert({
      leader, record_status: 'n', record_type: 'a', bibliographic_level: 'm',
      encoding_level: '#', cataloging_rules: 'a', created_by: 1,
    }).select().single();
    if (!record) continue;

    // Marc fields
    let fieldOrder = 0;
    const fieldsData = [
      { tag: '020', ind1: '#', ind2: '#', sub: { a: book.isbn } },
      { tag: '041', ind1: '0', ind2: '#', sub: { a: book.lang } },
      { tag: '100', ind1: '1', ind2: '#', sub: { a: book.author } },
      { tag: '245', ind1: '1', ind2: '0', sub: { a: book.title } },
      { tag: '260', ind1: '#', ind2: '#', sub: { a: 'Hà Nội', b: book.publisher, c: String(book.year) } },
      { tag: '300', ind1: '#', ind2: '#', sub: { a: book.pages, c: book.size } },
    ];
    for (const f of fieldsData) {
      const { data: field } = await supabase.from('marc_fields').insert({
        record_id: record.id, tag: f.tag, ind1: f.ind1, ind2: f.ind2, field_order: fieldOrder++,
      }).select().single();
      if (field && f.sub) {
        let subOrder = 0;
        for (const [code, value] of Object.entries(f.sub)) {
          await supabase.from('marc_subfields').insert({
            field_id: field.id, code, value, subfield_order: subOrder++,
          });
        }
      }
    }
    // 650 subject
    if (book.subject) {
      const { data: subjField } = await supabase.from('marc_fields').insert({
        record_id: record.id, tag: '650', ind1: '#', ind2: '7', field_order: fieldOrder++,
      }).select().single();
      if (subjField) {
        await supabase.from('marc_subfields').insert({
          field_id: subjField.id, code: 'a', value: book.subject, subfield_order: 0,
        });
      }
    }

    // Bib item
    const titleSearch = normalizeSearch(book.title);
    const { data: bib } = await supabase.from('bib_items').insert({
      marc_record_id: record.id, title: book.title, title_search: titleSearch,
      author_main: book.author, publisher_name: book.publisher, publish_year: book.year,
      isbn: book.isbn, pages: book.pages, size_cm: book.size, language_code: book.lang,
      subjects: [book.subject], summary: `${book.title} của tác giả ${book.author} là một tác phẩm quan trọng trong lĩnh vực ${book.subject}.`,
    }).select().single();
    if (!bib) continue;

    // Items (physical copies)
    const shelf = book.subject === 'Thiếu nhi' ? 'Kho Thiếu nhi' : SECTIONS[Math.floor(Math.random() * 3)];
    for (let c = 0; c < book.copies; c++) {
      const dkcb = `M.${String(100000 + totalItems + 1)}`;
      const barcode = `BAR${String(100000 + totalItems + 1)}`;
      await supabase.from('items').insert({
        bib_id: bib.id, dkcb, barcode, format: 'book', shelf_section: shelf,
        status: 'available', acquired_date: randomDate('2025-01-01', 400),
      });
      totalItems++;
    }
    if (BOOKS.indexOf(book) % 5 === 0) process.stdout.write('.');
  }
  console.log(`\n  ✅ ${BOOKS.length} đầu sách, ${totalItems} bản sao`);

  // 5. Seed circulation (mượn/trả mẫu)
  console.log('\n⏳ Tạo giao dịch mượn/trả...');
  const { data: allItems } = await supabase.from('items').select('id,bib_id,bib_items!inner(title)').limit(100);
  let circCount = 0;
  for (let i = 0; i < 15 && allItems && i < allItems.length; i++) {
    const item = allItems[i];
    const patronIdx = i % PATRONS.length;
    const checkoutDate = randomDate('2026-05-01', 40);
    const dueDate = new Date(checkoutDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // 10 giao dịch đã trả, 5 đang mượn
    if (i < 10) {
      const checkinDate = new Date(checkoutDate);
      checkinDate.setDate(checkinDate.getDate() + 15 + Math.floor(Math.random() * 10));
      const checkinStr = checkinDate.toISOString().split('T')[0];
      let fee = 0;
      if (checkinDate > dueDate) {
        const days = Math.ceil((checkinDate - dueDate) / (1000*60*60*24));
        fee = days * 5000;
      }
      await supabase.from('circulation').insert({
        item_id: item.id, patron_id: patronIdx + 1,
        checkout_date: checkoutDate, due_date: dueDateStr,
        checkin_date: checkinStr, status: 'returned',
        fee_amount: fee, fee_paid: fee === 0, checkout_by: 1, checkin_by: 1,
        created_at: checkoutDate + 'T08:00:00Z',
      });
      // Cập nhật item về available
      await supabase.from('items').update({ status: 'available' }).eq('id', item.id);
      if (fee > 0) {
        await supabase.from('fines').insert({
          circulation_id: null, patron_id: patronIdx + 1,
          amount: fee, reason: 'overdue', status: 'unpaid',
        });
      }
    } else {
      // Đang mượn — một số quá hạn
      const actualDueDate = i >= 13 ? new Date('2026-06-01').toISOString().split('T')[0] : dueDateStr;
      await supabase.from('circulation').insert({
        item_id: item.id, patron_id: patronIdx + 1,
        checkout_date: checkoutDate, due_date: actualDueDate,
        status: 'active', checkout_by: 1,
        created_at: checkoutDate + 'T08:00:00Z',
      });
      await supabase.from('items').update({ status: 'checked_out' }).eq('id', item.id);
    }
    circCount++;
  }
  console.log(`  ✅ ${circCount} giao dịch (10 đã trả, 5 đang mượn — trong đó có quá hạn)`);

  // 6. Seed một số notification
  console.log('\n⏳ Tạo thông báo mẫu...');
  for (let i = 1; i <= 5; i++) {
    await supabase.from('notifications').insert({
      patron_id: i, title: 'Sắp đến hạn trả sách',
      body: `Bạn có sách sắp đến hạn trả. Vui lòng mang sách đến thư viện trước ngày ${randomDate('2026-06-15', 15)}.`,
      type: 'due_soon', is_read: i > 3,
      sent_at: new Date().toISOString(),
    });
  }
  console.log('  ✅ 5 thông báo mẫu');

  // 7. Seed reviews
  console.log('\n⏳ Tạo đánh giá mẫu...');
  const { data: bibItems } = await supabase.from('bib_items').select('id').limit(10);
  for (let i = 0; bibItems && i < Math.min(8, bibItems.length); i++) {
    await supabase.from('reviews').insert({
      patron_id: (i % 5) + 1, bib_id: bibItems[i].id, rating: 3 + Math.floor(Math.random() * 3),
      comment: ['Hay','Tuyệt vời','Bổ ích','Nên đọc','Tạm được'][Math.floor(Math.random() * 5)],
    });
  }
  console.log('  ✅ 8 đánh giá mẫu');

  // 8. Seed một số log tìm kiếm
  console.log('\n⏳ Tạo log tìm kiếm...');
  const keywords = ['văn hóa','lịch sử','toán','vật lý','thiếu nhi','kinh tế','văn học','tâm lý','mạng máy tính','RFID'];
  for (let i = 0; i < 30; i++) {
    await supabase.from('search_logs').insert({
      query: keywords[Math.floor(Math.random() * keywords.length)],
      search_type: 'basic', result_count: Math.floor(Math.random() * 50),
      created_at: randomDate('2026-05-15', 28) + 'T' + String(6 + Math.floor(Math.random() * 12)).padStart(2,'0') + ':00:00',
    });
  }
  console.log('  ✅ 30 log tìm kiếm');

  // ─── TỔNG KẾT ───
  console.log('\n══════════════════════════════════════════');
  console.log('🎉 HOÀN THÀNH!');
  console.log('══════════════════════════════════════════');
  console.log(`📚 ${BOOKS.length} đầu sách, ${totalItems} bản sao`);
  console.log(`👤 ${PATRONS.length} bạn đọc (mật khẩu: reader123)`);
  console.log(`🔄 ${circCount} giao dịch mượn/trả`);
  console.log(`⭐ 8 đánh giá`);
  console.log(`🔔 5 thông báo`);
  console.log(`📊 30 log tìm kiếm\n`);
  console.log('👉 Vào http://localhost:3000 để trải nghiệm!');
}

seed().catch(e => { console.error('❌ Lỗi:', e.message); process.exit(1); });
