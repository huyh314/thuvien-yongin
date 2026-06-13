const { supabase } = require('../../../config/database');

async function generateReceiptCode() {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from('acquisitions')
    .select('receipt_code')
    .like('receipt_code', `PN-${year}-%`)
    .order('receipt_code', { ascending: false })
    .limit(1);
  let nextNum = 1;
  if (data && data.length > 0) {
    const parts = data[0].receipt_code.split('-');
    nextNum = parseInt(parts[2]) + 1;
  }
  return `PN-${year}-${String(nextNum).padStart(3, '0')}`;
}

async function createReceipt(data, userId) {
  const receiptCode = await generateReceiptCode();
  const { data: receipt, error } = await supabase.from('acquisitions').insert({
    receipt_code: receiptCode,
    vendor: data.vendor || null,
    received_date: data.receivedDate || new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: data.notes || null,
    created_by: userId || 1,
  }).select().single();
  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      await supabase.from('acquisition_items').insert({
        acquisition_id: receipt.id,
        title: item.title,
        author: item.author || null,
        publisher: item.publisher || null,
        publish_year: item.publishYear || null,
        isbn: item.isbn || null,
        price: item.price || null,
        quantity: item.quantity || 1,
        received_qty: 0,
        status: 'pending',
      });
    }
  }
  return await getReceipt(receipt.id);
}

async function getReceipts(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const { data, count, error } = await supabase
    .from('acquisitions')
    .select('*, users!left(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  const results = (data || []).map(r => ({
    ...r, created_by_name: r.users?.full_name || 'Unknown',
  }));
  return { total: count || 0, page, limit, results };
}

async function getReceipt(id) {
  const { data: receipt, error } = await supabase.from('acquisitions')
    .select('*, users!left(full_name)').eq('id', id).single();
  if (error || !receipt) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy phiếu.' };
  const { data: items } = await supabase.from('acquisition_items')
    .select('*').eq('acquisition_id', id).order('id');
  return { ...receipt, created_by_name: receipt.users?.full_name, items: items || [] };
}

async function updateItemStatus(itemId, status, receivedQty) {
  const updates = { status };
  if (receivedQty !== undefined) updates.received_qty = receivedQty;
  const { error } = await supabase.from('acquisition_items').update(updates).eq('id', itemId);
  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  // Cập nhật trạng thái phiếu
  const { data: item } = await supabase.from('acquisition_items').select('acquisition_id').eq('id', itemId).single();
  if (item) await updateReceiptStatus(item.acquisition_id);
  return { message: 'Đã cập nhật.' };
}

async function updateReceiptStatus(acquisitionId) {
  const { data: items } = await supabase.from('acquisition_items')
    .select('status').eq('acquisition_id', acquisitionId);
  if (!items || items.length === 0) return;
  const allReceived = items.every(i => i.status === 'received');
  const anyRejected = items.some(i => i.status === 'rejected');
  let status = 'processing';
  if (allReceived) status = 'completed';
  else if (anyRejected) status = 'processing';
  await supabase.from('acquisitions').update({ status, updated_at: new Date().toISOString() }).eq('id', acquisitionId);
}

async function completeReceipt(id) {
  const { data: receipt } = await supabase.from('acquisitions').select('*').eq('id', id).single();
  if (!receipt) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy phiếu.' };
  await supabase.from('acquisitions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', id);
  // Tự động tạo items từ acquisition_items đã received
  const { data: items } = await supabase.from('acquisition_items')
    .select('*').eq('acquisition_id', id).eq('status', 'received');
  if (items) {
    for (const item of items) {
      for (let i = 0; i < (item.received_qty || item.quantity || 1); i++) {
        const dkcb = `M.${String(Math.floor(Math.random() * 900000) + 100000)}`;
        await supabase.from('bib_items').upsert({
          title: item.title, title_search: item.title ? item.title.toLowerCase().replace(/[àáảãạ]/g,'a').replace(/[èéẻẽẹ]/g,'e').replace(/[ìíỉĩị]/g,'i').replace(/[òóỏõọ]/g,'o').replace(/[ùúủũụ]/g,'u').replace(/[ỳýỷỹỵ]/g,'y').replace(/đ/g,'d') : '',
          author_main: item.author, publisher_name: item.publisher, publish_year: item.publish_year, isbn: item.isbn,
        }, { onConflict: 'id' });
        const { data: bib } = await supabase.from('bib_items').select('id').eq('title', item.title).order('id', { ascending: false }).limit(1);
        const bibId = bib && bib[0]?.id;
        if (bibId) {
          await supabase.from('items').insert({ bib_id: bibId, dkcb, shelf_section: 'Kho Mượn', status: 'available', acquired_date: new Date().toISOString().split('T')[0], stamp_done: false });
        }
      }
    }
  }
  return { message: 'Phiếu đã hoàn tất. Đã tạo ' + (items?.length || 0) + ' bản ghi.' };
}

module.exports = { createReceipt, getReceipts, getReceipt, updateItemStatus, completeReceipt };
