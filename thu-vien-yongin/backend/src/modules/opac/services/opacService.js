const { supabase } = require('../../../config/database');
const { normalizeSearch } = require('../../../utils/vietnamese');
const es = require('../../../services/elasticsearch');

async function basicSearch(query, type = 'all', page = 1, limit = 20) {
  // Thử Elasticsearch trước, fallback DB nếu lỗi
  if (es.isEnabled() && query && query.trim()) {
    try {
      const esResult = await es.search(query, { type, page, limit });
      const enriched = await Promise.all((esResult.results || []).map(async (b) => {
        const bid = b.id || 0;
        const { count: total } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', bid);
        const { count: avail } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', bid).eq('status', 'available');
        const highlight = b.highlight?.title?.[0] || b.highlight?.summary?.[0] || '';
        return {
          id: bid, title: b.title, author_main: b.author_main, isbn: b.isbn,
          publisher_name: b.publisher_name, publish_year: b.publish_year,
          subjects: b.subjects, summary: b.summary, cover_url: b.cover_url,
          language_code: b.language_code, pages: '', size_cm: '',
          total_copies: total || 0, available_copies: avail || 0,
          is_available: (avail || 0) > 0, rating: 0,
          highlight: highlight.replace(/\*\*/g, ''),
        };
      }));
      return { total: esResult.total, page, limit, totalPages: Math.ceil((esResult.total || 0) / limit), query, type, suggestions: esResult.suggestions || [], results: enriched };
    } catch (e) {
      console.warn('ES search failed, using DB:', e.message.substring(0, 80));
    }
  }

  // DB fallback
  const offset = (page - 1) * limit;
  const sq = normalizeSearch(query);
  let col = null;
  if (type === 'author') col = 'author_main';
  else if (type === 'title') col = 'title_search';

  let queryBuilder = supabase.from('bib_items').select('*', { count: 'exact' });
  if (col) { queryBuilder = queryBuilder.ilike(col, `%${sq}%`); }
  else { queryBuilder = queryBuilder.or(`title_search.ilike.%${sq}%,author_main.ilike.%${sq}%,isbn.ilike.%${sq}%`); }

  const { data, count, error } = await queryBuilder.order('publish_year', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;

  const results = await Promise.all((data || []).map(async (b) => {
    const { count: total } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', b.id);
    const { count: avail } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', b.id).eq('status', 'available');
    const { data: rev } = await supabase.from('reviews').select('rating').eq('bib_id', b.id);
    const avgRating = rev && rev.length > 0 ? (rev.reduce((s, r) => s + r.rating, 0) / rev.length) : 0;
    return { ...b, total_copies: total || 0, available_copies: avail || 0, is_available: (avail || 0) > 0, rating: Math.round(avgRating * 10) / 10 };
  }));

  const { data: suggestions } = await supabase.from('bib_items').select('title').ilike('title_search', `${sq}%`).limit(5);

  return { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit), query, type, suggestions: (suggestions || []).map(s => s.title), results };
}

async function advancedSearch(filters, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  let queryBuilder = supabase.from('bib_items').select('*', { count: 'exact' });

  if (filters.title) queryBuilder = queryBuilder.ilike('title_search', `%${normalizeSearch(filters.title)}%`);
  if (filters.author) queryBuilder = queryBuilder.ilike('author_main', `%${normalizeSearch(filters.author)}%`);
  if (filters.publisher) queryBuilder = queryBuilder.ilike('publisher_name', `%${normalizeSearch(filters.publisher)}%`);
  if (filters.year_from) queryBuilder = queryBuilder.gte('publish_year', parseInt(filters.year_from));
  if (filters.year_to) queryBuilder = queryBuilder.lte('publish_year', parseInt(filters.year_to));
  if (filters.language) queryBuilder = queryBuilder.eq('language_code', filters.language);

  const { data, count, error } = await queryBuilder
    .order('publish_year', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const results = await Promise.all((data || []).map(async (b) => {
    const { count: avail } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', b.id).eq('status', 'available');
    return { ...b, available_copies: avail || 0, is_available: (avail || 0) > 0 };
  }));

  return {
    total: count || 0, page, limit,
    totalPages: Math.ceil((count || 0) / limit),
    filters, operator: filters.operator || 'AND',
    results,
  };
}

async function suggest(query) {
  const sq = normalizeSearch(query);
  if (!sq || sq.length < 1) return { suggestions: [] };
  const { data: titles } = await supabase.from('bib_items').select('title').ilike('title_search', `${sq}%`).limit(10);
  const { data: authors } = await supabase.from('bib_items').select('author_main').not('author_main', 'is', null).ilike('author_main', `${sq}%`).limit(5);
  return {
    suggestions: [
      ...(titles || []).map(t => ({ text: t.title, type: 'title' })),
      ...(authors || []).filter(a => a.author_main).map(a => ({ text: a.author_main, type: 'author' })),
    ].slice(0, 10),
  };
}

async function getWorkDetail(id) {
  const { data: bib, error } = await supabase.from('bib_items').select('*').eq('id', id).single();
  if (error || !bib) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu.' };

  const { data: items } = await supabase.from('items').select('*').eq('bib_id', id);
  const { count: avail } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', id).eq('status', 'available');
  const { count: total } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', id);
  const { data: rev } = await supabase.from('reviews').select('rating').eq('bib_id', id);
  const avgRating = rev && rev.length > 0 ? (rev.reduce((s, r) => s + r.rating, 0) / rev.length) : 0;

  return {
    ...bib, items: items || [],
    available_copies: avail || 0, total_copies: total || 0,
    avg_rating: Math.round(avgRating * 10) / 10,
    review_count: rev ? rev.length : 0,
  };
}

async function addReview(bibId, patronId, rating, comment) {
  const { data: existing } = await supabase.from('reviews').select('id').eq('patron_id', patronId).eq('bib_id', bibId).maybeSingle();
  if (existing) {
    await supabase.from('reviews').update({ rating, comment: comment || null }).eq('id', existing.id);
    return { message: 'Đã cập nhật đánh giá.' };
  }
  await supabase.from('reviews').insert({ patron_id: patronId, bib_id: bibId, rating, comment: comment || null });
  return { message: 'Đã thêm đánh giá.' };
}

async function getNewest(limit = 12) {
  const { data } = await supabase.from('bib_items')
    .select('id, title, author_main, publish_year, cover_url, isbn')
    .order('created_at', { ascending: false }).limit(limit);
  const results = await Promise.all((data || []).map(async (b) => {
    const { count: avail } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', b.id).eq('status', 'available');
    return { ...b, available_copies: avail || 0 };
  }));
  return results;
}

async function getFeatured() {
  const { data: popular } = await supabase.from('bib_items')
    .select('id, title, author_main, cover_url').limit(10);
  return {
    topics: [
      { name: 'Sách mới nhập', slug: 'newest' },
      { name: 'Thiếu nhi', slug: 'thieu-nhi' },
      { name: 'Khoa học', slug: 'khoa-hoc' },
      { name: 'Văn học', slug: 'van-hoc' },
      { name: 'Giải trí', slug: 'giai-tri' },
    ],
    popular: popular || [],
  };
}

async function logSearch(patronId, query, filters, resultCount, searchType, ipAddress) {
  try {
    await supabase.from('search_logs').insert({
      patron_id: patronId || null, query: query || '',
      filters: filters || null, result_count: resultCount || 0,
      search_type: searchType || 'basic', ip_address: ipAddress || null,
    });
  } catch (e) { /* ignore */ }
}

module.exports = { basicSearch, advancedSearch, suggest, getWorkDetail, addReview, getNewest, getFeatured, logSearch };
