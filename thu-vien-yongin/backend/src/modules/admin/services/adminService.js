const { supabase } = require('../../../config/database');

async function getDashboard() {
  const { count: totalTitles } = await supabase.from('bib_items').select('*', { count: 'exact', head: true });
  const { count: totalItems } = await supabase.from('items').select('*', { count: 'exact', head: true });
  const { count: totalPatrons } = await supabase.from('patrons').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: totalStaff } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: activeCheckouts } = await supabase.from('circulation').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: overdueCount } = await supabase.from('circulation').select('*', { count: 'exact', head: true }).eq('status', 'active').lt('due_date', new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const { count: monthlyCheckouts } = await supabase.from('circulation').select('*', { count: 'exact', head: true }).gte('checkout_date', thirtyDaysAgo).lte('checkout_date', today);

  return {
    total_titles: totalTitles || 0, total_items: totalItems || 0,
    total_patrons: totalPatrons || 0, total_staff: totalStaff || 0,
    active_checkouts: activeCheckouts || 0, overdue_count: overdueCount || 0,
    monthly_checkouts: monthlyCheckouts || 0,
  };
}

async function getStaff() {
  const { data } = await supabase
    .from('users')
    .select(`id, username, full_name, email, phone, status, last_login, created_at, role_id, roles(name)`);
  return (data || []).map(u => ({ ...u, role_name: u.roles?.name }));
}

async function updateStaffStatus(userId, status) {
  if (!['active','suspended'].includes(status)) throw { status: 400, code: 'INVALID_STATUS', message: 'Trạng thái không hợp lệ.' };
  await supabase.from('users').update({ status }).eq('id', userId);
  return { message: 'Đã cập nhật trạng thái.' };
}

async function getReport(type) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  switch (type) {
    case 'overview': return await getDashboard();
    case 'circulation': {
      const { data } = await supabase.rpc('get_circulation_report', { start_date: thirtyDaysAgo, end_date: today });
      return data || [];
    }
    case 'new-acquisitions': {
      const { data } = await supabase.from('items').select('created_at, shelf_section').gte('created_at', thirtyDaysAgo).lte('created_at', today);
      return data || [];
    }
    case 'cataloging-stats': {
      const { data } = await supabase
        .from('marc_records')
        .select(`created_by, users!inner(full_name)`)
        .gte('created_at', thirtyDaysAgo);
      const counts = {};
      (data || []).forEach(r => {
        const name = r.users?.full_name || 'unknown';
        counts[name] = (counts[name] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ full_name: name, records_created: count }));
    }
    case 'ddc-stats': {
      const { data } = await supabase.from('bib_items').select('subjects');
      const counts = {};
      (data || []).forEach(r => {
        if (r.subjects) r.subjects.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      });
      return Object.entries(counts).map(([subject, count]) => ({ subject, count }));
    }
    case 'language-stats': {
      const { data } = await supabase.from('bib_items').select('language_code');
      const counts = {};
      (data || []).forEach(r => { const l = r.language_code || 'vie'; counts[l] = (counts[l] || 0) + 1; });
      return Object.entries(counts).map(([code, count]) => ({ language_code: code, count }));
    }
    default: throw { status: 400, code: 'INVALID_REPORT', message: `Loại báo cáo '${type}' không tồn tại.` };
  }
}

async function getConfig() {
  const { data } = await supabase.from('system_config').select('key, value, description').order('key');
  return data || [];
}

async function updateConfig(key, value, userId) {
  const { data: existing } = await supabase.from('system_config').select('id').eq('key', key).maybeSingle();
  if (existing) {
    await supabase.from('system_config').update({ value, updated_by: userId, updated_at: new Date().toISOString() }).eq('key', key);
  } else {
    await supabase.from('system_config').insert({ key, value, updated_by: userId });
  }
  return { key, value, message: 'Đã cập nhật.' };
}

async function getStandard(type) {
  const tables = { cutter: 'cutter_table', languages: 'language_codes', keywords: 'keywords', shelves: 'shelf_locations' };
  if (!tables[type]) throw { status: 400, code: 'INVALID_TYPE', message: `Danh mục '${type}' không tồn tại.` };
  const { data } = await supabase.from(tables[type]).select('*').order('id');
  return data || [];
}

async function getPopularKeywords(limit = 20) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabase
    .from('search_logs')
    .select('query')
    .gte('created_at', thirtyDaysAgo)
    .limit(limit);
  return data || [];
}

async function getDdcStats() {
  const { data } = await supabase.from('bib_items').select('subjects');
  if (!data) return [];
  const counts = {};
  for (const item of data) {
    if (item.subjects && Array.isArray(item.subjects)) {
      for (const s of item.subjects) {
        counts[s] = (counts[s] || 0) + 1;
      }
    }
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
}

async function getLanguageStats() {
  const { data } = await supabase.from('bib_items').select('language_code');
  if (!data) return [];
  const counts = {};
  const langNames = { vie: 'Tiếng Việt', eng: 'Tiếng Anh', fre: 'Tiếng Pháp', chi: 'Tiếng Trung', jpn: 'Tiếng Nhật', kor: 'Tiếng Hàn', ger: 'Tiếng Đức', rus: 'Tiếng Nga' };
  for (const item of data) {
    const code = item.language_code || 'unknown';
    counts[code] = (counts[code] || 0) + 1;
  }
  return Object.entries(counts).map(([code, count]) => ({ name: langNames[code] || code, code, count }));
}

async function getMonthlyCirculation(from, to) {
  const { data } = await supabase.from('circulation').select('checkout_date').gte('checkout_date', from).lte('checkout_date', to);
  if (!data) return [];
  const counts = {};
  for (const item of data) {
    const month = item.checkout_date.substring(0, 7);
    counts[month] = (counts[month] || 0) + 1;
  }
  return Object.entries(counts).map(([month, count]) => ({ month, count })).sort();
}

module.exports = { getDashboard, getStaff, updateStaffStatus, getReport, getConfig, updateConfig, getStandard, getPopularKeywords, getDdcStats, getLanguageStats, getMonthlyCirculation };
