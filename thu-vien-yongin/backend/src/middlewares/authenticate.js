const jwt = require('jsonwebtoken');
const config = require('../config');
const { supabase } = require('../config/database');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Thiếu token xác thực.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Token đã hết hạn.' });
      }
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token không hợp lệ.' });
    }

    // Dùng supabase thay vì pool.query()
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, username, full_name, status,
        role_id,
        roles!inner(name)
      `)
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại.' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'USER_INACTIVE', message: 'Tài khoản đã bị khóa.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: user.roles?.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi xác thực.' });
  }
}

module.exports = authenticate;
