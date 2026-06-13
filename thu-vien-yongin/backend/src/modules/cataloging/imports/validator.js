const VALID_TAGS = ['020','041','082','100','110','245','246','250','260','300','490','500','504','520','600','610','650','651','653','655','700','710','852','856','910'];
const REQUIRED_TAGS = ['245', '852'];

function validateRow(row, index) {
  const errors = [];
  if (!row.title || row.title.toString().trim() === '') errors.push(`Dòng ${index}: Thiếu nhan đề (245$a)`);
  if (!row.dkcb || row.dkcb.toString().trim() === '') errors.push(`Dòng ${index}: Thiếu ĐKCB (852$j)`);
  return { valid: errors.length === 0, errors };
}

function validateMarc21Fields(fields) {
  const errors = [];
  if (!fields['245']) errors.push('Thiếu trường 245 (Nhan đề chính)');
  if (!fields['852']) errors.push('Thiếu trường 852 (Nơi lưu trữ)');
  for (const tag of Object.keys(fields)) {
    if (!VALID_TAGS.includes(tag)) errors.push(`Trường ${tag} không hợp lệ`);
  }
  return { valid: errors.length === 0, errors };
}

function validateIso2709Record(record) {
  const errors = [];
  if (!record.fields) return { valid: false, errors: ['Biểu ghi rỗng'] };
  if (!record.fields['245']) errors.push('Thiếu trường 245');
  if (!record.fields['852']) errors.push('Thiếu trường 852');
  return { valid: errors.length === 0, errors };
}

module.exports = { validateRow, validateMarc21Fields, validateIso2709Record, REQUIRED_TAGS };
