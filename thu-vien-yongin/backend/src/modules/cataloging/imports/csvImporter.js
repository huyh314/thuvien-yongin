/**
 * CSV / Excel Importer
 * 
 * Format CSV tối thiểu:
 *   title,author,publisher,publishYear,isbn,dkcb,shelf
 */
const XLSX = require('xlsx');

function parseCsv(buffer, delimiter = ',') {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    if (Object.values(row).some(v => v)) rows.push(row);
  }

  return rows;
}

function parseCsvLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const rows = [];
  for (const raw of data) {
    const row = {};
    for (const key of Object.keys(raw)) {
      row[key.toString().toLowerCase().trim()] = (raw[key] || '').toString().trim();
    }
    if (Object.values(row).some(v => v)) rows.push(row);
  }

  return rows;
}

function csvRowToFields(row) {
  const fields = {};

  if (row.title) {
    fields['245'] = [{ ind1: '1', ind2: '0', subfields: { a: row.title, c: row.author || '' } }];
  }
  if (row.author) {
    fields['100'] = [{ ind1: '1', ind2: '#', subfields: { a: row.author } }];
  }
  if (row.publisher || row.publishyear) {
    fields['260'] = [{ ind1: '#', ind2: '#', subfields: {
      b: row.publisher || '',
      c: row.publishyear ? row.publishyear.toString() : '',
    } }];
  }
  if (row.isbn) fields['020'] = [{ ind1: '#', ind2: '#', subfields: { a: row.isbn } }];
  if (row.dkcb) {
    fields['852'] = [{ ind1: '#', ind2: '#', subfields: {
      a: 'Thư viện Đà Nẵng',
      b: row.shelf || 'Kho Mượn',
      j: row.dkcb,
    } }];
  }
  if (row.ddc) fields['082'] = [{ ind1: '0', ind2: '4', subfields: { '2': '23', a: row.ddc } }];
  if (row.pages) fields['300'] = [{ ind1: '#', ind2: '#', subfields: { a: row.pages, c: row.size || '' } }];
  if (row.subject) fields['650'] = [{ ind1: '#', ind2: '7', subfields: { a: row.subject, '2': 'TVQG' } }];
  if (row.language) fields['041'] = [{ ind1: '0', ind2: '#', subfields: { a: row.language } }];
  if (row.summary) fields['520'] = [{ ind1: '#', ind2: '#', subfields: { a: row.summary } }];

  return fields;
}

module.exports = { parseCsv, parseExcel, csvRowToFields };
