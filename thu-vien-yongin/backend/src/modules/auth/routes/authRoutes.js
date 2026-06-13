const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

/**
 * POST /api/auth/login
 * Đăng nhập — public
 * Body: { username, password }
 * Response: { user, accessToken, refreshToken }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu.'
      });
    }

    const result = await authService.login(username, password);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
      });
    }
    console.error('Login error:', error.message);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống khi đăng nhập.'
    });
  }
});

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới — chỉ Admin
 * Body: { username, password, fullName, email?, phone?, roleId? }
 */
router.post('/register', authenticate, authorize('auth', 'write'), async (req, res) => {
  try {
    const { username, password, fullName, email, phone, roleId } = req.body;

    // Validate
    if (!username || !password || !fullName) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Vui lòng nhập đầy đủ: username, password, fullName.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Mật khẩu phải có ít nhất 6 ký tự.'
    });
    }

    const result = await authService.register({
      username,
      password,
      fullName,
      email,
      phone,
      roleId,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
      });
    }
    console.error('Register error:', error.message);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống khi đăng ký.'
    });
  }
});

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại — yêu cầu đăng nhập
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    return res.json(profile);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
      });
    }
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống khi lấy thông tin.'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Làm mới token — public (cần refreshToken)
 * Body: { refreshToken }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Vui lòng cung cấp refreshToken.'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
      });
    }
    console.error('Refresh token error:', error.message);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống khi làm mới token.'
    });
  }
});

module.exports = router;
