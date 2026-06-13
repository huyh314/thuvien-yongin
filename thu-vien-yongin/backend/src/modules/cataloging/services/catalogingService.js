const { supabase } = require('../../../config/database');
const { normalizeSearch } = require('../../../utils/vietnamese');
const { generateCutter } = require('../../../utils/cutter');

const VALID_TAGS = ['020','041','082','100','110','130','245','246','250','260','300','490','500','504','520','534','600','610','650','651','653','655','700','710','852','856','910'];

async function createRecord(data, userId) {
  const { fields } = data;
  if (!fields || !fields['245']) throw { status: 400, code: 'MISSING_245', message: 'Trường 245 (Nhan đề chính) là bắt buộc.' };
  if (!fields['852']) throw { status: 400, code: 'MISSING_852', message: 'Trường 852 (Nơi lưu trữ) là bắt buộc.' };

  // Tạo marc_record
  const { data: record, error: recErr } = await supabase.from('marc_records').insert({
    leader: '00869cam 2200265 a 4500', record_status: 'n', record_type: 'a',
    bibliographic_level: 'm', encoding_level: '#', cataloging_rules: 'a', created_by: userId || 1,
  }).select().single();
  if (recErr) throw { status: 500, code: 'DB_ERROR', message: recErr.message };

  const recordId = record.id;
  let fieldOrder = 0;

  for (const [tag, fieldData] of Object.entries(fields)) {
    if (!VALID_TAGS.includes(tag)) continue;
    const arr = Array.isArray(fieldData) ? fieldData : [fieldData];
    for (const f of arr) {
      const ind1 = (f.ind1 || '#').trim() || '#';
      const ind2 = (f.ind2 || '#').trim() || '#';
      const { data: field, error: fErr } = await supabase.from('marc_fields').insert({
        record_id: recordId, tag, ind1, ind2, field_order: fieldOrder++,
      }).select().single();
      if (fErr) throw { status: 500, code: 'DB_ERROR', message: fErr.message };
      if (f.subfields) {
        let so = 0;
        for (const [code, value] of Object.entries(f.subfields)) {
          const vals = Array.isArray(value) ? value : [value];
          for (const v of vals) {
            if (v) await supabase.from('marc_subfields').insert({
              field_id: field.id, code, value: v.toString(), subfield_order: so++,
            });
          }
        }
      }
    }
  }

  // Parse to bib_items
  await parseToBibItems(recordId, fields);
  const fullRecord = await getRecord(recordId);
  // Index vào Elasticsearch nếu có
  if (fullRecord.bibItem) {
    try { const es = require('../../../../services/elasticsearch'); await es.indexBook(fullRecord.bibItem); } catch (e) {}
  }
  return fullRecord;
}

async function parseToBibItems(recordId, fields) {
  const g = (tag, code, idx = 0) => {
    const f = fields[tag]; if (!f) return null;
    const a = Array.isArray(f) ? f : [f]; if (!a[idx]?.subfields) return null;
    return a[idx].subfields[code] || null;
  };
  const gAll = (tag, code) => {
    const f = fields[tag]; if (!f) return [];
    const a = Array.isArray(f) ? f : [f];
    const r = []; for (const i of a) { if (i.subfields?.[code]) { const v = i.subfields[code]; if (Array.isArray(v)) r.push(...v); else r.push(v); } } return r;
  };

  const title = g('245','a')||'', titleSearch = normalizeSearch(title);
  const authorMain = g('100','a')||g('110','a')||'';
  const authorAdded = gAll('700','a');
  const publisherName = g('260','b')||'', publisherPlace = g('260','a')||'';
  const publishYear = g('260','c')? parseInt(g('260','c'))||null : null;
  const isbn = g('020','a')||'', pages = g('300','a')||'', sizeCm = g('300','c')||'';
  const languageCode = g('041','a')||g('041','h')||'vie', summary = g('520','a')||'';
  const subjects = gAll('650','a'), series = g('490','a')||'';
  const shelfSection = g('852','b')||'', dkcb = g('852','j')||'';

  // Upsert bib_items
  await supabase.from('bib_items').upsert({
    marc_record_id: recordId, title, title_search: titleSearch, author_main: authorMain,
    author_added: authorAdded, publisher_name: publisherName, publisher_place: publisherPlace,
    publish_year: publishYear, isbn, pages, size_cm: sizeCm, language_code: languageCode,
    summary, subjects, series,
  }, { onConflict: 'marc_record_id' });

  // Create item if dkcb exists
  if (dkcb) {
    const { data: bib } = await supabase.from('bib_items').select('id').eq('marc_record_id', recordId).single();
    if (bib) {
      const { data: exist } = await supabase.from('items').select('id').eq('dkcb', dkcb).maybeSingle();
      if (!exist) {
        await supabase.from('items').insert({ bib_id: bib.id, dkcb, shelf_section: shelfSection || 'Kho Mượn', status: 'available' });
      }
    }
  }
}

async function searchDuplicate(title, author, year) {
  const t = normalizeSearch(title);
  const { data } = await supabase.from('bib_items')
    .select('id, title, author_main, publish_year, isbn, publisher_name, language_code, marc_record_id')
    .ilike('title_search', `%${t}%`)
    .limit(10);
  return { duplicate: data && data.length > 0, matches: data || [] };
}

async function getRecord(id) {
  const { data: record } = await supabase.from('marc_records').select('*').eq('id', id).single();
  if (!record) throw { status: 404, code: 'RECORD_NOT_FOUND', message: 'Không tìm thấy biểu ghi.' };

  const { data: fields } = await supabase.from('marc_fields')
    .select('id, tag, ind1, ind2, field_order, marc_subfields(code, value, subfield_order)')
    .eq('record_id', id).order('field_order');
  const { data: bibItem } = await supabase.from('bib_items').select('*').eq('marc_record_id', id).maybeSingle();
  const { data: items } = await supabase.from('items').select('*, shelf_locations!left(section)').in('bib_id',
    (await supabase.from('bib_items').select('id').eq('marc_record_id', id)).data?.map(b=>b.id) || []
  );

  return { record, fields: fields || [], bibItem, items: items || [] };
}

async function updateRecord(id, data, userId) {
  const { data: exist } = await supabase.from('marc_records').select('id').eq('id', id).single();
  if (!exist) throw { status: 404, code: 'RECORD_NOT_FOUND', message: 'Không tìm thấy biểu ghi.' };
  await supabase.from('marc_fields').delete().eq('record_id', id);
  await supabase.from('marc_records').update({ updated_at: new Date().toISOString(), record_status: 'c' }).eq('id', id);
  return await createRecord({ fields: data.fields }, userId);
}

async function deleteRecord(id) {
  const { data, error } = await supabase.from('marc_records')
    .update({ record_status: 'd', updated_at: new Date().toISOString() })
    .eq('id', id).neq('record_status', 'd').select();
  if (!data || data.length === 0) throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy.' };
  return { id, status: 'deleted' };
}

async function searchRecords(query, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const sq = normalizeSearch(query);
  const { data, count } = await supabase.from('bib_items')
    .select('*', { count: 'exact' })
    .or(`title_search.ilike.%${sq}%,author_main.ilike.%${sq}%,isbn.ilike.%${sq}%`)
    .order('publish_year', { ascending: false })
    .range(offset, offset + limit - 1);
  const enriched = await Promise.all((data || []).map(async b => {
    const { count: c } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('bib_id', b.id).eq('status', 'available');
    return { ...b, available_copies: c || 0 };
  }));
  return { total: count || 0, page, limit, totalPages: Math.ceil((count||0)/limit), results: enriched };
}

module.exports = { createRecord, searchDuplicate, getRecord, updateRecord, deleteRecord, searchRecords, generateCutter };
