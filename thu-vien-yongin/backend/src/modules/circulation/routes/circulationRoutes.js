const express = require('express');
const router = express.Router();
const circulationService = require('../services/circulationService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

/**
 * POST /api/circulation/checkout
 * Mượn sách
 * Body: { patronBarcode, itemBarcodes: [...] }
 */
router.post('/checkout', authenticate, authorize('circulation', 'write'), async (req, res) => {
  try {
    const { patronBarcode, itemBarcodes } = req.body;
    const result = await circulationService.checkout(patronBarcode, itemBarcodes, req.user.id);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Checkout error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi mượn sách.' });
  }
});

/**
 * POST /api/circulation/checkin
 * Trả sách
 * Body: { itemBarcodes: [...], checkinDate?: "YYYY-MM-DD" }
 */
router.post('/checkin', authenticate, authorize('circulation', 'write'), async (req, res) => {
  try {
    const { itemBarcodes, checkinDate } = req.body;
    const result = await circulationService.checkin(itemBarcodes, req.user.id, checkinDate);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Checkin error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi trả sách.' });
  }
});

/**
 * POST /api/circulation/:id/renew
 * Gia hạn sách
 */
router.post('/:id/renew', authenticate, async (req, res) => {
  try {
    const result = await circulationService.renew(
      parseInt(req.params.id),
      req.body.patronId || req.user.id
    );
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Renew error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi gia hạn.' });
  }
});

/**
 * GET /api/circulation/patron/:id/checkouts
 * Danh sách sách đang mượn của bạn đọc
 */
router.get('/patron/:id/checkouts', authenticate, async (req, res) => {
  try {
    const result = await circulationService.getPatronCheckouts(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    console.error('Get patron checkouts error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/circulation/overdue
 * Danh sách sách quá hạn
 */
router.get('/overdue', authenticate, authorize('circulation', 'read'), async (req, res) => {
  try {
    const result = await circulationService.getOverdueItems();
    return res.json(result);
  } catch (error) {
    console.error('Get overdue error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/circulation/stats
 * Thống kê mượn/trả
 */
router.get('/stats', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = to || new Date().toISOString().split('T')[0];
    const result = await circulationService.getCirculationStats(startDate, endDate);
    return res.json({ from: startDate, to: endDate, ...result });
  } catch (error) {
    console.error('Get stats error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
