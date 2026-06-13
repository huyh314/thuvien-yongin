const { supabase } = require('../config/database');

function authorize(module, action) {
  return async (req, res, next) => {
    try {
      if (req.user.roleId === 1) {
        return next();
      }

      const { data, error } = await supabase
        .from('permissions')
        .select('is_granted')
        .eq('role_id', req.user.roleId)
        .eq('module', module)
        .eq('action', action)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(403).json({ error: 'FORBIDDEN', message: `Không có quyền ${action} trên module ${module}.` });
      }

      if (!data.is_granted) {
        return res.status(403).json({ error: 'FORBIDDEN', message: `Quyền ${action} trên module ${module} đã bị vô hiệu.` });
      }

      next();
    } catch (error) {
      console.error('Authorize middleware error:', error.message);
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi kiểm tra quyền.' });
    }
  };
}

module.exports = authorize;
