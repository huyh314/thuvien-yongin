const { supabase } = require('../config/database');

/**
 * Tạo thông báo
 */
async function createNotification(patronId, title, body, type, referenceType, referenceId) {
  try {
    await supabase.from('notifications').insert({
      patron_id: patronId,
      title: title || '',
      body: body || '',
      type: type || 'general',
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      is_read: false,
      sent_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
}

/**
 * Kiểm tra holds khi trả sách
 * Nếu có holds → tạo notification cho người đặt
 */
async function checkHoldsOnCheckin(itemId) {
  const { data: holds } = await supabase
    .from('holds')
    .select('id, patron_id, items!inner(dkcb, bib_items!inner(title))')
    .eq('item_id', itemId)
    .eq('status', 'pending')
    .order('hold_date')
    .limit(1);

  if (holds && holds.length > 0) {
    const hold = holds[0];
    // Cập nhật hold thành ready
    await supabase.from('holds').update({ status: 'ready' }).eq('id', hold.id);
    
    // Tạo notification
    await createNotification(
      hold.patron_id,
      '📚 Sách đã có sẵn',
      `Sách "${hold.items?.bib_items?.title || ''}" đã được trả. Vui lòng đến thư viện mượn trong 3 ngày.`,
      'book_available',
      'hold',
      hold.id
    );
    return true;
  }
  return false;
}

/**
 * Kiểm tra sách sắp hạn → tạo thông báo
 */
async function checkDueDates() {
  const today = new Date().toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const { data: checkouts } = await supabase
    .from('circulation')
    .select('id, patron_id, due_date, items!inner(dkcb, bib_items!inner(title))')
    .eq('status', 'active')
    .gte('due_date', today)
    .lte('due_date', in3Days);

  if (checkouts) {
    for (const co of checkouts) {
      // Kiểm tra đã gửi thông báo chưa
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('patron_id', co.patron_id)
        .eq('type', 'due_soon')
        .eq('reference_id', co.id)
        .maybeSingle();

      if (!existing) {
        await createNotification(
          co.patron_id,
          '⏰ Sắp đến hạn trả sách',
          `Sách "${co.items?.bib_items?.title || ''}" đến hạn trả ngày ${co.due_date}. Vui lòng mang sách đến thư viện.`,
          'due_soon',
          'circulation',
          co.id
        );
      }
    }
  }
}

module.exports = { createNotification, checkHoldsOnCheckin, checkDueDates };
