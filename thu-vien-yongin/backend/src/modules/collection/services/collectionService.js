const { supabase } = require('../../../config/database');

async function getSections() {
  const { data } = await supabase
    .from('shelf_locations')
    .select('section')
    .eq('status', 'active')
    .order('section');
  return [...new Set((data || []).map(r => r.section))];
}

async function getItems(shelf, status, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  let query = supabase
    .from('items')
    .select('*, bib_items(title, author_main, publish_year, isbn)', { count: 'exact' });

  if (shelf) query = query.eq('shelf_section', shelf);
  if (status) query = query.eq('status', status);

  const { data, count, error } = await query
    .range(offset, offset + limit - 1)
    .order('dkcb');

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  return { total: count || 0, page, limit, results: data || [] };
}

async function transferItems(itemIds, toShelf, userId) {
  if (!itemIds || itemIds.length === 0) throw { status: 400, code: 'MISSING_ITEMS', message: 'Chọn ít nhất một tài liệu.' };
  if (!toShelf) throw { status: 400, code: 'MISSING_SHELF', message: 'Chọn kho đích.' };

  const { data, error } = await supabase
    .from('items')
    .update({ shelf_section: toShelf, updated_at: new Date().toISOString() })
    .in('id', itemIds)
    .select('id, dkcb, shelf_section');

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  for (const item of data || []) {
    await supabase.from('audit_logs').insert({
      user_id: userId, action: 'TRANSFER', module: 'collection',
      entity_type: 'item', entity_id: item.id,
      new_value: JSON.stringify({ shelf_section: toShelf }),
    }).maybeSingle();
  }

  return { message: `Đã chuyển ${data?.length || 0} tài liệu sang ${toShelf}.`, items: data || [] };
}

async function discardItems(itemIds, reason, date, userId) {
  if (!itemIds || itemIds.length === 0) throw { status: 400, code: 'MISSING_ITEMS', message: 'Chọn ít nhất một tài liệu.' };
  const discardDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('items')
    .update({ status: 'discarded', discarded_date: discardDate, notes: reason || 'Thanh lý', updated_at: new Date().toISOString() })
    .in('id', itemIds)
    .neq('status', 'discarded')
    .select('id, dkcb');

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  return { message: `Đã thanh lý ${data?.length || 0} tài liệu.`, items: data || [] };
}

async function createInventorySession(userId) {
  const { data, error } = await supabase
    .from('inventory_sessions')
    .insert({ started_by: userId, status: 'in_progress' })
    .select()
    .single();
  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  await supabase.from('items').update({ status: 'pending_scan' }).in('status', ['available', 'checked_out']);
  return { sessionId: data.id, start_date: data.start_date, status: data.status };
}

async function scanItem(sessionId, barcode) {
  const { data: item, error: itemErr } = await supabase
    .from('items')
    .select('*, bib_items(title)')
    .or(`barcode.eq.${barcode},dkcb.eq.${barcode}`)
    .maybeSingle();
  if (itemErr || !item) throw { status: 404, code: 'ITEM_NOT_FOUND', message: `Không tìm thấy: ${barcode}` };

  const newStatus = item.status === 'checked_out' ? 'checked_out' : 'available';

  await supabase.from('inventory_details').upsert({
    session_id: sessionId, item_id: item.id, barcode_scanned: barcode,
    scan_time: new Date().toISOString(), found: true,
  }).maybeSingle();

  await supabase.from('items').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', item.id);

  return { dkcb: item.dkcb, title: item.bib_items?.title, status: newStatus };
}

async function getInventoryReport(sessionId) {
  const { data: session } = await supabase.from('inventory_sessions').select('*').eq('id', sessionId).single();
  if (!session) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy phiên kiểm kê.' };

  const { count: totalItems } = await supabase.from('items').select('*', { count: 'exact', head: true });
  const { count: scannedItems } = await supabase.from('inventory_details').select('*', { count: 'exact', head: true }).eq('session_id', sessionId);
  const { count: missingItems } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'pending_scan');
  const { data: misplaced } = await supabase.from('inventory_details').select('*', { count: 'exact' }).eq('session_id', sessionId).not('actual_shelf', 'is', null);
  const { data: details } = await supabase.from('items').select('dkcb, barcode, status, shelf_section, bib_items(title)').eq('status', 'pending_scan').order('dkcb');

  return {
    session, totalItems: totalItems || 0, scannedItems: scannedItems || 0,
    missingItems: missingItems || 0, misplacedItems: misplaced?.length || 0,
    missingDetails: details || [],
  };
}

async function completeInventorySession(sessionId, userId) {
  const { error } = await supabase
    .from('inventory_sessions')
    .update({ end_date: new Date().toISOString(), status: 'completed', completed_by: userId })
    .eq('id', sessionId)
    .eq('status', 'in_progress');
  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  return { message: 'Kiểm kê hoàn tất.', sessionId };
}

module.exports = {
  getSections, getItems, transferItems, discardItems,
  createInventorySession, scanItem, getInventoryReport, completeInventorySession,
};
