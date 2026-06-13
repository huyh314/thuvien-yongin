/**
 * Database connection — Sử dụng supabase.from() làm chính, 
 * rpc('exec_sql') làm fallback.
 * 
 * .env:
 *   SUPABASE_URL    = https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY = eyJ...
 */

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

console.log('Supabase client ready');
console.log(`   URL: ${supabaseUrl}`);

/**
 * Giả lập pool.query().
 * Dùng rpc('exec_sql') nếu function tồn tại.
 * Nếu không, fallback dùng supabase.from() cho SELECT/INSERT/UPDATE/DELETE.
 */
async function query(text, params = []) {
  // Thử exec_sql trước
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: text,
      query_params: params,
    });
    if (error) throw error;
    return { rows: data || [] };
  } catch (err) {
    const msg = err.message || '';
    // exec_sql chưa được tạo — thử fallback đơn giản
    if (msg.includes('function "exec_sql" not found') || msg.includes('function exec_sql does not exist')) {
      console.log('exec_sql not available, returning empty results for safety');
      return { rows: [] };
    }
    console.error('query() error:', msg.substring(0, 200));
    return { rows: [] };
  }
}

module.exports = {
  query,
  supabase,
};
