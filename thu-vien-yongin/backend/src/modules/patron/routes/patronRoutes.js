const express = require('express');
const router = express.Router();
const patronService = require('../services/patronService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

/**
 * POST /api/patron/register
 * Đăng ký bạn đọc mới — public (ai cũng đăng ký được)
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, idCard, dob, gender, address, phone, email, password, patronType } = req.body;
    if (!fullName) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Vui lòng nhập họ tên.' });
    }
    const result = await patronService.register({ fullName, idCard, dob, gender, address, phone, email, password, patronType });
    return res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Register patron error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi đăng ký.' });
  }
});

/**
 * POST /api/patron/login
 * Đăng nhập cho bạn đọc — public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Vui lòng nhập email/mã thẻ và mật khẩu.' });
    }
    const result = await patronService.login(email, password);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Patron login error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi đăng nhập.' });
  }
});

/**
 * GET /api/patron/search?q=&page=&limit=
 * Tìm kiếm bạn đọc — Thủ thư
 */
router.get('/search', authenticate, authorize('patron', 'read'), async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'MISSING_QUERY', message: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }
    const result = await patronService.search(q, parseInt(page) || 1, parseInt(limit) || 20);
    return res.json(result);
  } catch (error) {
    console.error('Search patron error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id
 * Thông tin chi tiết bạn đọc
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await patronService.getProfile(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    console.error('Get patron error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * PUT /api/patron/:id
 * Cập nhật thông tin bạn đọc
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Chỉ cho phép bạn đọc sửa thông tin của mình, hoặc thủ thư sửa
    if (req.user.roleName !== 'admin' && req.user.roleName !== 'librarian' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Không có quyền sửa thông tin này.' });
    }
    const result = await patronService.updateProfile(parseInt(req.params.id), req.body);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Update patron error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/history?page=&limit=
 * Lịch sử mượn/trả
 */
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await patronService.getHistory(
      parseInt(req.params.id),
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    return res.json(result);
  } catch (error) {
    console.error('Get history error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/card
 * Thẻ thư viện số (QR data)
 */
router.get('/:id/card', async (req, res) => {
  try {
    const result = await patronService.getCardData(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    console.error('Get card error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/wishlist
 * Danh sách yêu thích
 */
router.get('/:id/wishlist', authenticate, async (req, res) => {
  try {
    const result = await patronService.getWishlist(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    console.error('Get wishlist error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * POST /api/patron/:id/wishlist
 * Thêm vào yêu thích
 */
router.post('/:id/wishlist', authenticate, async (req, res) => {
  try {
    const { bibId } = req.body;
    if (!bibId) {
      return res.status(400).json({ error: 'MISSING_BIB_ID', message: 'Thiếu thông tin sách.' });
    }
    const result = await patronService.addToWishlist(parseInt(req.params.id), bibId);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Add wishlist error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * DELETE /api/patron/:id/wishlist/:bibId
 * Xóa khỏi yêu thích
 */
router.delete('/:id/wishlist/:bibId', authenticate, async (req, res) => {
  try {
    const result = await patronService.removeFromWishlist(parseInt(req.params.id), parseInt(req.params.bibId));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    console.error('Remove wishlist error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/notifications?page=&limit=
 * Danh sách thông báo
 */
router.get('/:id/notifications', authenticate, async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await patronService.getNotifications(
      parseInt(req.params.id),
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    return res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * PUT /api/patron/notifications/:id/read
 * Đánh dấu đã đọc thông báo
 */
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const result = await patronService.markNotificationRead(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/checkouts
 * Sách đang mượn
 */
router.get('/:id/checkouts', authenticate, async (req, res) => {
  try {
    const { supabase } = require('../../../config/database');
    const { data } = await supabase
      .from('circulation')
      .select('*, items(dkcb, shelf_section, bib_items(id, title, author_main))')
      .eq('patron_id', req.params.id)
      .eq('status', 'active')
      .order('checkout_date', { ascending: false });
    return res.json(data || []);
  } catch (error) {
    console.error('Get checkouts error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/patron/:id/history
 * Lịch sử mượn/trả
 */
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const { supabase } = require('../../../config/database');
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const { data, count } = await supabase
      .from('circulation')
      .select('*, items(dkcb, bib_items(title, author_main))', { count: 'exact' })
      .eq('patron_id', req.params.id)
      .order('checkout_date', { ascending: false })
      .range(offset, offset + limit - 1);
    return res.json({ total: count || 0, page, limit, data: data || [] });
  } catch (error) {
    console.error('Get history error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
