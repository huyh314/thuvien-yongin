const { supabase } = require('../../../config/database');
const notificationService = require('../../../services/notificationService');

async function checkout(patronBarcode, itemBarcodes, librarianId) {
  if (!patronBarcode || !itemBarcodes || itemBarcodes.length === 0)
    throw { status: 400, code: 'MISSING_DATA', message: 'Thiếu thông tin.' };

  // 1. Kiểm tra bạn đọc
  const { data: patron } = await supabase.from('patrons').select('*').eq('card_barcode', patronBarcode).single();
  if (!patron) throw { status: 404, code: 'PATRON_NOT_FOUND', message: 'Không tìm thấy bạn đọc.' };
  if (patron.status !== 'active') throw { status: 400, code: 'PATRON_INACTIVE', message: 'Thẻ đã bị khóa.' };

  // 2. Kiểm tra quá hạn
  const { count: overdue } = await supabase.from('circulation').select('*', { count: 'exact', head: true })
    .eq('patron_id', patron.id).eq('status', 'active').lt('due_date', new Date().toISOString().split('T')[0]);
  if (overdue > 0) throw { status: 400, code: 'HAS_OVERDUE', message: 'Có sách quá hạn chưa trả.' };

  // 3. Kiểm tra hạn mức
  const { count: active } = await supabase.from('circulation').select('*', { count: 'exact', head: true })
    .eq('patron_id', patron.id).eq('status', 'active');
  if (active + itemBarcodes.length > patron.max_checkouts)
    throw { status: 400, code: 'OVER_LIMIT', message: `Chỉ được mượn tối đa ${patron.max_checkouts} cuốn.` };

  // 4. Xử lý từng cuốn
  const now = new Date(); const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + patron.max_days);
  const results = [];

  for (const barcode of itemBarcodes) {
    const { data: item } = await supabase.from('items').select('*, bib_items!inner(title)')
      .or(`barcode.eq.${barcode},dkcb.eq.${barcode}`).single();
    if (!item) throw { status: 404, code: 'ITEM_NOT_FOUND', message: `Không tìm thấy: ${barcode}` };
    if (item.status !== 'available') throw { status: 400, code: 'ITEM_UNAVAILABLE', message: `"${item.title}" không có sẵn.` };

    const { data: circ } = await supabase.from('circulation').insert({
      item_id: item.id, patron_id: patron.id,
      checkout_date: now.toISOString().split('T')[0], due_date: dueDate.toISOString().split('T')[0],
      status: 'active', checkout_by: librarianId || 1,
    }).select().single();

    await supabase.from('items').update({ status: 'checked_out', updated_at: now.toISOString() }).eq('id', item.id);
    
    // Tạo notification sắp hạn
    try {
      await notificationService.createNotification(
        patron.id, '⏰ Sắp đến hạn trả',
        `Sách "${item.title || ''}" hạn trả ngày ${dueDate.toISOString().split('T')[0]}`,
        'due_soon', 'circulation', circ.id
      );
    } catch(e) { /* ignore */ }

    results.push({ circulationId: circ.id, title: item.title, dkcb: item.dkcb, dueDate: dueDate.toISOString().split('T')[0] });
  }
  return { success: true, message: `Mượn ${results.length} cuốn.`, items: results, dueDate: dueDate.toISOString().split('T')[0] };
}

async function checkin(itemBarcodes, librarianId, checkinDate) {
  if (!itemBarcodes || itemBarcodes.length === 0) throw { status: 400, code: 'MISSING_DATA', message: 'Thiếu sách.' };
  const date = checkinDate ? new Date(checkinDate) : new Date();
  const today = date.toISOString().split('T')[0];
  const results = [];

  for (const barcode of itemBarcodes) {
    const { data: item } = await supabase.from('items').select('*, bib_items!inner(title)')
      .or(`barcode.eq.${barcode},dkcb.eq.${barcode}`).single();
    if (!item) throw { status: 404, code: 'ITEM_NOT_FOUND', message: `Không tìm thấy: ${barcode}` };

    const { data: circ } = await supabase.from('circulation').select('*')
      .eq('item_id', item.id).eq('status', 'active').order('checkout_date', { ascending: false }).limit(1).single();
    if (!circ) throw { status: 400, code: 'NOT_CHECKED_OUT', message: `"${item.title}" không được mượn.` };

    let fee = 0; let overdueDays = 0;
    if (date > new Date(circ.due_date)) {
      overdueDays = Math.ceil((date - new Date(circ.due_date)) / (1000 * 60 * 60 * 24));
      const { data: p } = await supabase.from('patrons').select('fee_per_day').eq('id', circ.patron_id).single();
      fee = overdueDays * (p?.fee_per_day || 5000);
    }

    await supabase.from('circulation').update({
      checkin_date: today, status: 'returned', fee_amount: fee, checkin_by: librarianId || 1, updated_at: new Date().toISOString(),
    }).eq('id', circ.id);

    if (fee > 0) {
      await supabase.from('fines').insert({ circulation_id: circ.id, patron_id: circ.patron_id, amount: fee, reason: 'overdue', status: 'unpaid' });
    }
    await supabase.from('items').update({ status: 'available', updated_at: new Date().toISOString() }).eq('id', item.id);
    
    // Kiểm tra holds khi trả sách
    try {
      const hasHold = await notificationService.checkHoldsOnCheckin(item.id);
      if (hasHold) {
        results[results.length - 1].holdNotified = true;
      }
    } catch(e) { /* ignore */ }

    results.push({ title: item.title, dkcb: item.dkcb, overdueDays, feeAmount: fee, feePaid: false });
  }
  return { success: true, message: `Trả ${results.length} cuốn.`, items: results };
}

async function renew(circulationId, patronId) {
  const { data: circ } = await supabase.from('circulation').select('*, patrons!inner(max_days)').eq('id', circulationId).eq('patron_id', patronId).eq('status', 'active').single();
  if (!circ) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy giao dịch.' };
  if (circ.renew_count >= 1) throw { status: 400, code: 'MAX_RENEW', message: 'Chỉ gia hạn 1 lần.' };
  if (new Date(circ.due_date) < new Date()) throw { status: 400, code: 'OVERDUE', message: 'Đã quá hạn, mang đến quầy.' };

  const newDue = new Date(circ.due_date); newDue.setDate(newDue.getDate() + (circ.patrons?.max_days || 30));
  await supabase.from('circulation').update({ due_date: newDue.toISOString().split('T')[0], renew_count: circ.renew_count + 1, updated_at: new Date().toISOString() }).eq('id', circulationId);
  return { success: true, message: 'Gia hạn thành công.', newDueDate: newDue.toISOString().split('T')[0] };
}

async function getPatronCheckouts(patronId) {
  const { data } = await supabase.from('circulation')
    .select('id, checkout_date, due_date, status, renew_count, fee_amount, fee_paid, items!inner(dkcb, barcode, bib_items!inner(title, author_main, isbn, cover_url))')
    .eq('patron_id', patronId).order('checkout_date', { ascending: false });
  const today = new Date().toISOString().split('T')[0];
  return (data || []).map(c => ({ ...c, is_overdue: c.status === 'active' && c.due_date < today }));
}

async function getOverdueItems() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.from('circulation')
    .select('id, checkout_date, due_date, fee_amount, patrons!inner(card_barcode, full_name, phone), items!inner(dkcb, bib_items!inner(title, author_main))')
    .eq('status', 'active').lt('due_date', today).order('due_date');
  return (data || []).map(c => ({
    id: c.id, checkout_date: c.checkout_date, due_date: c.due_date,
    fee_amount: c.fee_amount, card_barcode: c.patrons?.card_barcode,
    patron_name: c.patrons?.full_name, phone: c.patrons?.phone,
    dkcb: c.items?.dkcb, title: c.items?.bib_items?.title, author_main: c.items?.bib_items?.author_main,
  }));
}

async function getCirculationStats(startDate, endDate) {
  const { data } = await supabase.from('circulation').select('status, checkout_date, checkin_date, fee_amount, fee_paid');
  const stats = {
    total_checkouts: data?.filter(c => c.checkout_date >= startDate && c.checkout_date <= endDate).length || 0,
    total_checkins: data?.filter(c => c.checkin_date && c.checkin_date >= startDate && c.checkin_date <= endDate).length || 0,
    active_checkouts: data?.filter(c => c.status === 'active').length || 0,
    overdue_count: data?.filter(c => c.status === 'active' && c.due_date && c.due_date < new Date().toISOString().split('T')[0]).length || 0,
    total_fees: data?.filter(c => c.checkin_date && c.checkin_date >= startDate && c.checkin_date <= endDate).reduce((s, c) => s + parseFloat(c.fee_amount || 0), 0) || 0,
    collected_fees: data?.filter(c => c.fee_paid && c.checkin_date && c.checkin_date >= startDate && c.checkin_date <= endDate).reduce((s, c) => s + parseFloat(c.fee_amount || 0), 0) || 0,
  };
  return stats;
}

module.exports = { checkout, checkin, renew, getPatronCheckouts, getOverdueItems, getCirculationStats };
