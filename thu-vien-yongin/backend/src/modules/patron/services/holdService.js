const { supabase } = require('../../config/database');

async function createHold(patronId, bibId, options = {}) {
  const { data: items } = await supabase.from('items').select('id, status').eq('bib_id', bibId).eq('status', 'available').limit(1);
  if (!items || items.length === 0) throw { status: 400, code: 'NOT_AVAILABLE', message: 'Sách không có bản nào khả dụng.' };

  const { data, error } = await supabase.from('holds').insert({
    item_id: items[0].id,
    patron_id: patronId,
    hold_date: options.holdDate || new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'pending',
    notes: options.notes || null,
  }).select().single();

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  await supabase.from('notifications').insert({
    patron_id: patronId,
    title: 'Đặt mượn thành công',
    body: `Đã đặt mượn sách. Vui lòng đến nhận trước ${new Date(Date.now() + 7 * 86400000).toLocaleDateString('vi-VN')}.`,
    type: 'hold_ready',
    is_read: false,
    sent_at: new Date().toISOString(),
  });

  return { id: data.id, status: 'pending', message: 'Đặt mượn thành công.' };
}

async function getPatronHolds(patronId) {
  const { data } = await supabase.from('holds')
    .select('*, items(dkcb, shelf_section, bib_items(id, title, author_main))')
    .eq('patron_id', patronId)
    .order('created_at', { ascending: false });
  return data || [];
}

async function cancelHold(holdId, patronId) {
  const { data } = await supabase.from('holds').select('id, patron_id').eq('id', holdId).single();
  if (!data) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu đặt mượn.' };
  if (data.patron_id !== patronId) throw { status: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền hủy yêu cầu này.' };
  await supabase.from('holds').update({ status: 'cancelled' }).eq('id', holdId);
  return { message: 'Đã hủy yêu cầu đặt mượn.' };
}

module.exports = { createHold, getPatronHolds, cancelHold };
