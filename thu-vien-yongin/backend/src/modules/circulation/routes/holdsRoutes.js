const express = require('express');
const router = express.Router();
const { supabase } = require('../../../config/database');
const authenticate = require('../../../middlewares/authenticate');
const notificationService = require('../../../services/notificationService');

// POST /api/holds - đặt mượn trước
router.post('/', authenticate, async (req, res) => {
  try {
    const { itemId, patronId } = req.body;
    const pid = patronId || req.user?.id;
    if (!itemId || !pid) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Thiếu thông tin.' });
    }

    // Kiểm tra item tồn tại và đang được mượn
    const { data: item } = await supabase.from('items').select('id, status, bib_items!inner(title)').eq('id', itemId).single();
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài liệu.' });

    // Kiểm tra đã đặt chưa
    const { data: existing } = await supabase.from('holds').select('id').eq('item_id', itemId).eq('patron_id', pid).eq('status', 'pending').maybeSingle();
    if (existing) return res.status(400).json({ error: 'ALREADY_HELD', message: 'Bạn đã đặt mượn tài liệu này rồi.' });

    const { data: hold, error } = await supabase.from('holds').insert({
      item_id: itemId, patron_id: pid,
      hold_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
    }).select().single();

    if (error) return res.status(500).json({ error: 'DB_ERROR', message: error.message });
    return res.status(201).json(hold);
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// GET /api/holds/patron/:id - danh sách đặt mượn
router.get('/patron/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('holds')
      .select('*, items!inner(dkcb, bib_items!inner(title, author_main, cover_url))')
      .eq('patron_id', parseInt(req.params.id))
      .order('hold_date', { ascending: false });
    if (error) return res.status(500).json({ error: 'DB_ERROR', message: error.message });
    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// POST /api/holds/:id/cancel - hủy đặt
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { error } = await supabase.from('holds').update({ status: 'cancelled' }).eq('id', parseInt(req.params.id));
    if (error) return res.status(500).json({ error: 'DB_ERROR', message: error.message });
    return res.json({ message: 'Đã hủy đặt mượn.' });
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
