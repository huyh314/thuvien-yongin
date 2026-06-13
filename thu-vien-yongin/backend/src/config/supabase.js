/**
 * Kết nối Supabase
 * 
 * Yêu cầu .env:
 *   SUPABASE_URL    = https://xxx.supabase.co
 *   SUPABASE_ANON_KEY = eyJ... (public anon key)
 *   SUPABASE_SERVICE_KEY = eyJ... (service_role key — dùng cho backend)
 * 
 * Service key bypass RLS — chỉ dùng ở backend (giữ bí mật)
 * Anon key dùng ở frontend — có RLS
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`
  ╔══════════════════════════════════════════════════════════╗
  ║  ❌ THIẾU CẤU HÌNH SUPABASE                           ║
  ║  Vui lòng thêm vào .env:                               ║
  ║    SUPABASE_URL=https://xxx.supabase.co                 ║
  ║    SUPABASE_SERVICE_KEY=eyJ...                         ║
  ╚══════════════════════════════════════════════════════════╝
  `);
}

// Service client — dùng cho backend, bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client — dùng cho public operations (nếu cần)
const supabaseAnon = process.env.SUPABASE_ANON_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY)
  : null;

/**
 * Helper: xử lý lỗi Supabase trả về
 * Chuyển đổi lỗi Supabase thành format chuẩn của app
 */
function handleError(error, defaultMessage = 'Lỗi hệ thống.') {
  if (!error) return null;
  
  // Supabase error codes
  switch (error.code) {
    case 'PGRST116':
      return { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy dữ liệu.' };
    case '23505':
      return { status: 409, code: 'DUPLICATE', message: 'Dữ liệu đã tồn tại.' };
    case '23503':
      return { status: 400, code: 'FK_VIOLATION', message: 'Dữ liệu liên quan không tồn tại.' };
    case '42501':
      return { status: 403, code: 'RLS_DENIED', message: 'Không có quyền truy cập dữ liệu.' };
    case '42703':
      return { status: 400, code: 'INVALID_COLUMN', message: 'Trường dữ liệu không hợp lệ.' };
    default:
      console.error('Supabase error:', error);
      return { status: 500, code: 'SUPABASE_ERROR', message: error.message || defaultMessage };
  }
}

/**
 * Helper: single() an toàn — không throw nếu không tìm thấy
 */
async function findById(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw handleError(error);
  return data;
}

/**
 * Helper: kiểm tra dòng đầu tiên có tồn tại không
 */
async function exists(table, column, value) {
  const { data, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, value);
  
  if (error) throw handleError(error);
  return data && data.length > 0;
}

module.exports = {
  supabase,
  supabaseAnon,
  handleError,
  findById,
  exists,
};
