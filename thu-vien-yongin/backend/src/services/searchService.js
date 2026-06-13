const elasticsearch = require('./elasticsearch');
const pool = require('../config/database');

async function searchBooks(query, type = 'all', page = 1, limit = 20, options = {}) {
  if (elasticsearch.isEnabled()) {
    try {
      return await elasticsearch.search(query, { type, page, limit, ...options });
    } catch (e) {
      console.warn('ES search failed, using DB fallback:', e.message.substring(0, 80));
    }
  }
  return await dbSearch(query, type, page, limit);
}

async function dbSearch(query, type = 'all', page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const { normalizeSearch } = require('./vietnamese');
  const searchNorm = normalizeSearch(query);
  const searchLike = `%${searchNorm}%`;

  let whereClause = '';
  const params = [];
  let p = 0;

  switch (type) {
    case 'author':
      params.push(searchLike); p++; whereClause = `b.author_main ILIKE $${p}`;
      break;
    case 'title':
      params.push(searchLike); p++; whereClause = `b.title_search ILIKE $${p}`;
      break;
    case 'subject':
      params.push(searchLike); p++; whereClause = `EXISTS (SELECT 1 FROM unnest(b.subjects) s WHERE s ILIKE $${p})`;
      break;
    default:
      p = 4;
      whereClause = `(b.title_search ILIKE $1 OR b.author_main ILIKE $2 OR b.isbn ILIKE $3 OR EXISTS (SELECT 1 FROM unnest(b.subjects) s WHERE s ILIKE $4))`;
      params.push(searchLike, searchLike, searchLike, searchLike);
      break;
  }

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM bib_items b WHERE ${whereClause}`, params);
    const total = parseInt(countResult.rows[0]?.count || 0);

    params.push(limit, offset); p += 2;
    const result = await pool.query(
      `SELECT b.id, b.title, b.author_main, b.publisher_name, b.publish_year,
              b.isbn, b.pages, b.size_cm, b.language_code, b.summary, b.subjects, b.cover_url,
              (SELECT COUNT(*) FROM items WHERE bib_id = b.id) as total_copies,
              (SELECT COUNT(*) FROM items WHERE bib_id = b.id AND status = 'available') as available_copies,
              CASE WHEN (SELECT COUNT(*) FROM items WHERE bib_id = b.id AND status = 'available') > 0 THEN true ELSE false END as is_available,
              (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE bib_id = b.id) as rating
       FROM bib_items b WHERE ${whereClause}
       ORDER BY b.publish_year DESC NULLS LAST, b.title
       LIMIT $${p - 1} OFFSET $${p}`,
      params
    );

    return { total, page, limit, results: result.rows, suggestions: [] };
  } catch (e) {
    console.error('DB search error:', e.message);
    return { total: 0, page, limit, results: [], suggestions: [] };
  }
}

async function indexBookAfterSave(book) {
  if (elasticsearch.isEnabled()) {
    await elasticsearch.indexBook(book);
  }
}

module.exports = { searchBooks, indexBookAfterSave, dbSearch };
