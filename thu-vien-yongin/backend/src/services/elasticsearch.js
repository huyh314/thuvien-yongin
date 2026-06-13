const { Client } = require('@elastic/elasticsearch');

let client = null;
let enabled = false;

function init() {
  const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  try {
    client = new Client({
      node,
      requestTimeout: 5000,
      maxRetries: 2,
      sniffOnStart: false,
    });
    enabled = true;
    console.log(`Elasticsearch client ready: ${node}`);
  } catch (e) {
    console.warn(`Elasticsearch not available: ${e.message}. Using DB fallback.`);
    enabled = false;
  }
}

function isEnabled() { return enabled; }

async function ensureIndex() {
  if (!enabled || !client) return;
  try {
    const exists = await client.indices.exists({ index: 'bib_items' });
    if (exists) return;

    await client.indices.create({
      index: 'bib_items',
      body: {
        settings: {
          analysis: {
            analyzer: {
              vietnamese_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'integer' },
            title: { type: 'text', analyzer: 'vietnamese_analyzer', fields: { keyword: { type: 'keyword' } } },
            title_search: { type: 'text', analyzer: 'standard' },
            author_main: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            isbn: { type: 'keyword' },
            subjects: { type: 'text' },
            summary: { type: 'text', analyzer: 'vietnamese_analyzer' },
            publish_year: { type: 'integer' },
            language_code: { type: 'keyword' },
            publisher_name: { type: 'text' },
            available_copies: { type: 'integer' },
            cover_url: { type: 'keyword', index: false },
          },
        },
      },
    });
    console.log('Elasticsearch index bib_items created');
  } catch (e) {
    console.warn('ES index creation failed:', e.message);
    enabled = false;
  }
}

async function indexBook(book) {
  if (!enabled || !client) return;
  try {
    await client.index({
      index: 'bib_items',
      id: book.id?.toString(),
      body: {
        id: book.id,
        title: book.title || '',
        title_search: book.title_search || '',
        author_main: book.author_main || '',
        isbn: book.isbn || '',
        subjects: book.subjects || [],
        summary: book.summary || '',
        publish_year: book.publish_year || 0,
        language_code: book.language_code || 'vie',
        publisher_name: book.publisher_name || '',
        available_copies: book.available_copies || 0,
        cover_url: book.cover_url || '',
      },
    });
  } catch (e) { /* silent fail - book will be indexed next sync */ }
}

async function deleteBook(id) {
  if (!enabled || !client) return;
  try { await client.delete({ index: 'bib_items', id: id.toString() }); } catch (e) {}
}

async function reindexAll() {
  if (!enabled || !client) return 0;
  const { supabase } = require('../config/database');
  const { data } = await supabase.from('bib_items').select('*');
  if (!data) return 0;

  const body = data.flatMap((doc) => [
    { index: { _index: 'bib_items', _id: doc.id.toString() } },
    {
      id: doc.id, title: doc.title, title_search: doc.title_search,
      author_main: doc.author_main, isbn: doc.isbn, subjects: doc.subjects,
      summary: doc.summary, publish_year: doc.publish_year,
      language_code: doc.language_code, publisher_name: doc.publisher_name,
      cover_url: doc.cover_url,
    },
  ]);

  if (body.length === 0) return 0;
  const result = await client.bulk({ body, refresh: true });
  console.log(`ES reindexed ${data.length} books, errors: ${result.errors}`);
  return data.length;
}

async function search(query, options = {}) {
  if (!enabled || !client) throw new Error('ES_NOT_AVAILABLE');

  const { type = 'all', page = 1, limit = 20, language, yearFrom, yearTo } = options;
  const from = (page - 1) * limit;
  const must = [];
  const filter = [];

  if (type === 'all') {
    must.push({ multi_match: { query, fields: ['title^3', 'author_main^2', 'subjects', 'summary'] } });
  } else if (type === 'title') {
    must.push({ match: { title: { query, boost: 3 } } });
  } else if (type === 'author') {
    must.push({ match: { author_main: query } });
  } else if (type === 'subject') {
    must.push({ match: { subjects: query } });
  }

  if (language) filter.push({ term: { language_code: language } });
  if (yearFrom || yearTo) {
    filter.push({ range: { publish_year: { gte: yearFrom || 0, lte: yearTo || 9999 } } });
  }

  const body = {
    query: must.length > 0 ? { bool: { must, filter } } : { match_all: {} },
    from, size: limit,
    highlight: { fields: { title: {}, summary: {} }, pre_tags: ['**'], post_tags: ['**'] },
    suggest: {
      text: query,
      title_suggest: { term: { field: 'title', suggest_mode: 'popular', min_word_length: 2 } },
    },
  };

  const result = await client.search({ index: 'bib_items', body });
  const hits = result.hits.hits;

  return {
    total: typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total,
    page, limit,
    results: hits.map((h) => ({
      ...h._source,
      highlight: h.highlight,
    })),
    suggestions: (result.suggest?.title_suggest?.[0]?.options || []).map((o) => o.text),
  };
}

init();

module.exports = { init, isEnabled, ensureIndex, indexBook, deleteBook, reindexAll, search, client };
