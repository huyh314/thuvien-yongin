const { supabase } = require('../../../config/database');
const { exportIso2709 } = require('../exports/iso2709');
const { exportMarcXml } = require('../exports/marcxml');
const { exportCsv, exportExcel } = require('../exports/csvExporter');

async function getRecordsForExport(ids) {
  let query = supabase.from('marc_records').select('*, marc_fields(id, tag, ind1, ind2, field_order, marc_subfields(code, value, subfield_order))').order('created_at', { ascending: false });

  if (ids && ids.length > 0) query = query.in('id', ids);
  else query = query.limit(1000);

  const { data, error } = await query;
  if (error) throw error;

  return data.map(r => ({
    id: r.id,
    Leader: r.leader,
    status: r.record_status,
    Fields: r.marc_fields,
    fields: r.marc_fields,
  }));
}

async function getBibItemsForExport(ids) {
  let query = supabase.from('bib_items').select('*').order('created_at', { ascending: false });
  if (ids && ids.length > 0) query = query.in('id', ids);
  else query = query.limit(1000);

  const { data } = await query;
  return data || [];
}

async function exportRecords(format, ids) {
  let records, buffer, filename, contentType;

  switch (format.toLowerCase()) {
    case 'iso2709':
    case 'mrc':
      records = await getRecordsForExport(ids);
      buffer = exportIso2709(records);
      filename = 'yongin_catalog.mrc';
      contentType = 'application/marc';
      break;

    case 'marcxml':
    case 'xml':
      records = await getRecordsForExport(ids);
      buffer = Buffer.from(await exportMarcXml(records), 'utf-8');
      filename = 'yongin_catalog.xml';
      contentType = 'application/xml';
      break;

    case 'csv':
      records = await getBibItemsForExport(ids);
      buffer = exportCsv(records);
      filename = 'yongin_catalog.csv';
      contentType = 'text/csv';
      break;

    case 'excel':
    case 'xlsx':
      records = await getBibItemsForExport(ids);
      buffer = exportExcel(records);
      filename = 'yongin_catalog.xlsx';
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;

    default:
      throw { status: 400, code: 'INVALID_FORMAT', message: `Định dạng không hỗ trợ: ${format}` };
  }

  return { buffer, filename, contentType };
}

async function exportMarcRecords(ids) {
  const records = await getRecordsForExport(ids);
  return exportIso2709(records).toString('utf-8');
}

async function exportMarcXmlRecords(ids) {
  const records = await getRecordsForExport(ids);
  return exportMarcXml(records);
}

async function exportDublinCore(ids) {
  const records = await getBibItemsForExport(ids);
  const dcRecords = records.map(r => ({
    'dc:title': r.title,
    'dc:creator': r.author_main,
    'dc:publisher': r.publisher_name,
    'dc:date': r.publish_year,
    'dc:identifier': r.isbn,
    'dc:language': r.language_code,
    'dc:description': r.summary,
    'dc:subject': r.subjects?.join('; '),
  }));

  const xmlItems = dcRecords.map(r => {
    let out = '  <dc:record>\n';
    for (const [key, val] of Object.entries(r)) {
      if (val) out += `    <${key}>${val}</${key}>\n`;
    }
    out += '  </dc:record>\n';
    return out;
  });

  return '<?xml version="1.0" encoding="UTF-8"?>\n<dc:collection xmlns:dc="http://purl.org/dc/elements/1.1/">\n' + xmlItems.join('') + '</dc:collection>';
}

module.exports = { exportRecords, exportMarcRecords, exportMarcXmlRecords, exportDublinCore };
