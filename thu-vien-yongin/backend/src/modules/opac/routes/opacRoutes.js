const express = require('express');
const router = express.Router();
const opacService = require('../services/opacService');
const authenticate = require('../../../middlewares/authenticate');

/**
 * GET /api/opac/search?q=&type=all|author|title|subject&page=&limit=
 * Tìm kiếm cơ bản — public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type, page, limit } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'MISSING_QUERY', message: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }
    const result = await opacService.basicSearch(
      q, type || 'all', parseInt(page) || 1, parseInt(limit) || 20
    );
    // Ghi log (bất đồng bộ, không block response)
    opacService.logSearch(req.user?.id, q, { type }, result.total, 'basic', req.ip);
    return res.json(result);
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi tìm kiếm.' });
  }
});

/**
 * GET /api/opac/search/advanced
 * Tìm kiếm nâng cao — Boolean AND/OR/NOT
 */
router.get('/search/advanced', async (req, res) => {
  try {
    const result = await opacService.advancedSearch(
      req.query, parseInt(req.query.page) || 1, parseInt(req.query.limit) || 20
    );
    opacService.logSearch(req.user?.id, null, req.query, result.total, 'advanced', req.ip);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Advanced search error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/opac/suggest?q=văn
 * Gợi ý tìm kiếm — auto-suggest
 */
router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ suggestions: [] });
    const result = await opacService.suggest(q);
    return res.json(result);
  } catch (error) {
    console.error('Suggest error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/opac/works/:id
 * Chi tiết tài liệu — public
 */
router.get('/works/:id', async (req, res) => {
  try {
    const result = await opacService.getWorkDetail(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) return res.status(404).json({ error: error.code, message: error.message });
    console.error('Get work detail error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * POST /api/opac/works/:id/reviews
 * Đánh giá sách — cần đăng nhập
 */
router.post('/works/:id/reviews', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'INVALID_RATING', message: 'Đánh giá từ 1 đến 5 sao.' });
    }
    const result = await opacService.addReview(parseInt(req.params.id), req.user?.id || req.body.patronId, rating, comment);
    return res.json(result);
  } catch (error) {
    console.error('Add review error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/opac/newest?limit=12
 * Sách mới nhất
 */
router.get('/newest', async (req, res) => {
  try {
    const result = await opacService.getNewest(parseInt(req.query.limit) || 12);
    return res.json(result);
  } catch (error) {
    console.error('Get newest error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/opac/featured
 * Danh mục nổi bật
 */
router.get('/featured', async (req, res) => {
  try {
    const result = await opacService.getFeatured();
    return res.json(result);
  } catch (error) {
    console.error('Get featured error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
