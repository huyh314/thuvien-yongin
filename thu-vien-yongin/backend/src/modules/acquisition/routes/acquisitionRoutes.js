const express = require('express');
const router = express.Router();
const acquisitionService = require('../services/acquisitionService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

// POST /api/acquisition/receipts - tạo phiếu tiếp nhận
router.post('/receipts', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const result = await acquisitionService.createReceipt(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// GET /api/acquisition/receipts - danh sách phiếu
router.get('/receipts', authenticate, authorize('cataloging', 'read'), async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await acquisitionService.getReceipts(parseInt(page) || 1, parseInt(limit) || 20);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// GET /api/acquisition/receipts/:id - chi tiết phiếu
router.get('/receipts/:id', authenticate, async (req, res) => {
  try {
    const result = await acquisitionService.getReceipt(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// PUT /api/acquisition/receipts/items/:id - cập nhật trạng thái item
router.put('/receipts/items/:id', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const { status, receivedQty } = req.body;
    const result = await acquisitionService.updateItemStatus(parseInt(req.params.id), status, receivedQty);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// POST /api/acquisition/receipts/:id/complete - hoàn tất phiếu
router.post('/receipts/:id/complete', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const result = await acquisitionService.completeReceipt(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
