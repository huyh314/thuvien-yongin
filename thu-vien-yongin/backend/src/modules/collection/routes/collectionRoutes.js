const express = require('express');
const router = express.Router();
const collectionService = require('../services/collectionService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

// ─── Quản lý kho cơ bản ───

router.get('/sections', authenticate, authorize('collection', 'read'), async (req, res) => {
  try {
    const result = await collectionService.getSections();
    return res.json(result);
  } catch (error) {
    console.error('Get sections error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.get('/items', authenticate, authorize('collection', 'read'), async (req, res) => {
  try {
    const { shelf, status, page, limit } = req.query;
    const result = await collectionService.getItems(shelf, status, parseInt(page) || 1, parseInt(limit) || 50);
    return res.json(result);
  } catch (error) {
    console.error('Get items error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.post('/transfer', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const { itemIds, toShelf } = req.body;
    const result = await collectionService.transferItems(itemIds, toShelf, req.user.id);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Transfer error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.post('/discard', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const { itemIds, reason, date } = req.body;
    const result = await collectionService.discardItems(itemIds, reason, date, req.user.id);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Discard error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Kiểm kê ───

router.post('/inventory', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const result = await collectionService.createInventorySession(req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Create inventory error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.post('/inventory/scan', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const { sessionId, barcode } = req.body;
    if (!sessionId || !barcode) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Thiếu sessionId hoặc barcode.' });
    }
    const result = await collectionService.scanItem(sessionId, barcode);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Scan error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.get('/inventory/:id/report', authenticate, authorize('collection', 'read'), async (req, res) => {
  try {
    const result = await collectionService.getInventoryReport(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    console.error('Inventory report error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.post('/inventory/:id/complete', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const result = await collectionService.completeInventorySession(parseInt(req.params.id), req.user.id);
    return res.json(result);
  } catch (error) {
    console.error('Complete inventory error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// PUT /api/collection/items/:id/stamp - cập nhật trạng thái đóng dấu
router.put('/items/:id/stamp', authenticate, authorize('collection', 'write'), async (req, res) => {
  try {
    const { stamp_done, dkcb_date } = req.body;
    const updates = {};
    if (stamp_done !== undefined) updates.stamp_done = stamp_done;
    if (dkcb_date) updates.dkcb_date = dkcb_date;
    updates.updated_at = new Date().toISOString();
    
    const { error } = require('../../../config/database').supabase
      .from('items').update(updates).eq('id', parseInt(req.params.id));
    if (error) throw error;
    return res.json({ message: stamp_done ? '✅ Đã đóng dấu' : '⏳ Bỏ đóng dấu' });
  } catch (error) {
    console.error('Stamp update error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
