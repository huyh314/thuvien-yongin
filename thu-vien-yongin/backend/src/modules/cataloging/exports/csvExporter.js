/**
 * Export CSV / Excel
 */
const XLSX = require('xlsx');

function exportCsv(records) {
  const headers = ['ID', 'Nhan đề', 'Tác giả', 'NXB', 'Năm', 'ISBN', 'Số trang', 'DDC', 'Ngôn ngữ', 'ĐKCB', 'Kho'];
  const rows = [headers];

  for (const r of records) {
    rows.push([
      r.id || '',
      r.title || r.Title || '',
      r.authorMain || r.author_main || '',
      r.publisherName || r.publisher_name || '',
      r.publishYear || r.publish_year || '',
      r.isbn || '',
      r.pages || '',
      r.ddc || '',
      r.languageCode || r.language_code || '',
      r.dkcb || '',
      r.shelf || '',
    ]);
  }

  const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
  return Buffer.from(csv, 'utf-8');
}

function exportExcel(records, sheetName = 'Catalog') {
  const data = records.map(r => ({
    ID: r.id || '',
    'Nhan đề': r.title || r.Title || '',
    'Tác giả': r.authorMain || r.author_main || '',
    NXB: r.publisherName || r.publisher_name || '',
    Năm: r.publishYear || r.publish_year || '',
    ISBN: r.isbn || '',
    'Số trang': r.pages || '',
    DDC: r.ddc || '',
    'Ngôn ngữ': r.languageCode || r.language_code || '',
    ĐKCB: r.dkcb || '',
    Kho: r.shelf || '',
  }));

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(data);
  const colWidths = headers.map(h => ({ wch: Math.min(h.length + 10, 30) }));
  sheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

const headers = ['ID', 'Nhan đề', 'Tác giả', 'NXB', 'Năm', 'ISBN', 'Số trang', 'DDC', 'Ngôn ngữ', 'ĐKCB', 'Kho'];

module.exports = { exportCsv, exportExcel };
