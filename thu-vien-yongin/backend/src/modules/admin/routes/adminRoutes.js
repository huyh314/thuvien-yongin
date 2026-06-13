const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

// ─── Dashboard ───

router.get('/dashboard', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const result = await adminService.getDashboard();
    return res.json(result);
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Quản lý nhân sự ───

router.get('/staff', authenticate, authorize('admin', 'read'), async (req, res) => {
  try {
    const result = await adminService.getStaff();
    return res.json(result);
  } catch (error) {
    console.error('Get staff error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.put('/staff/:id/status', authenticate, authorize('admin', 'write'), async (req, res) => {
  try {
    const { status } = req.body;
    const result = await adminService.updateStaffStatus(parseInt(req.params.id), status);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Update staff status error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// DELETE /api/admin/staff/:id — Xóa nhân viên (Admin only)
router.delete('/staff/:id', authenticate, authorize('admin', 'delete'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Không cho xóa admin đầu tiên
    if (id === 1) {
      return res.status(400).json({ error: 'CANNOT_DELETE', message: 'Không thể xóa tài khoản admin mặc định.' });
    }
    const { error } = require('../../../config/database').supabase
      .from('users').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'Đã xóa tài khoản.' });
  } catch (error) {
    console.error('Delete staff error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi xóa.' });
  }
});

// ─── Báo cáo ───

router.get('/reports/:type', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const result = await adminService.getReport(req.params.type, from, to);
    return res.json({ type: req.params.type, from: from || 'all', to: to || 'all', data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Report error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Cấu hình hệ thống ───

router.get('/config', authenticate, authorize('admin', 'read'), async (req, res) => {
  try {
    const result = await adminService.getConfig();
    return res.json(result);
  } catch (error) {
    console.error('Get config error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.put('/config', authenticate, authorize('admin', 'write'), async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Thiếu key hoặc value.' });
    }
    const result = await adminService.updateConfig(key, value, req.user.id);
    return res.json(result);
  } catch (error) {
    console.error('Update config error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Danh mục chuẩn ───

router.get('/standards/:type', authenticate, async (req, res) => {
  try {
    const result = await adminService.getStandard(req.params.type);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Get standard error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Từ khóa hot ───

router.get('/popular-keywords', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const result = await adminService.getPopularKeywords(parseInt(req.query.limit) || 20);
    return res.json(result);
  } catch (error) {
    console.error('Get popular keywords error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

// ─── Chart APIs ───

router.get('/charts/ddc', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const result = await adminService.getDdcStats();
    return res.json(result);
  } catch (error) {
    console.error('DDC stats error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.get('/charts/languages', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const result = await adminService.getLanguageStats();
    return res.json(result);
  } catch (error) {
    console.error('Language stats error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

router.get('/charts/monthly-circulation', authenticate, authorize('report', 'read'), async (req, res) => {
  try {
    const from = req.query.from || '2026-01-01';
    const to = req.query.to || '2026-12-31';
    const result = await adminService.getMonthlyCirculation(from, to);
    return res.json(result);
  } catch (error) {
    console.error('Monthly circulation error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
