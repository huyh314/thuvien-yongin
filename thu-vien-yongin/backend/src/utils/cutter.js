/**
 * Thuật toán sinh mã Cutter (mã hóa tên sách)
 * Công thức: TP1 (nguyên/phụ âm đầu) + TP2 (mã vần) + TP3 (chữ đầu từ thứ 2)
 * 
 * Ví dụ: "Bác vẫn cùng chúng cháu hành quân" → B101V
 */

const { supabase } = require('../config/database');

// Số đếm tiếng Việt
const VIETNAMESE_NUMBERS = {
  '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn',
  '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín',
  '10': 'mười', '20': 'hai mươi', '30': 'ba mươi', '40': 'bốn mươi',
  '50': 'năm mươi', '60': 'sáu mươi', '70': 'bảy mươi', '80': 'tám mươi',
  '90': 'chín mươi',
};

function numberToVietnamese(num) {
  if (VIETNAMESE_NUMBERS[num]) return VIETNAMESE_NUMBERS[num];
  const numStr = num.toString();
  if (numStr.length === 2) {
    const tens = parseInt(numStr[0]) * 10;
    const ones = parseInt(numStr[1]);
    if (ones === 0) return numberToVietnamese(tens);
    if (ones === 5) return `${numberToVietnamese(tens)} lăm`;
    return `${numberToVietnamese(tens)} ${numberToVietnamese(ones)}`;
  }
  return num;
}

/**
 * Lấy phần "vần" của từ (phần sau phụ âm đầu)
 * VD: "bác" → phụ âm đầu "b" → vần "ác" (chuẩn hóa thành "AC")
 * VD: "anh" → nguyên âm đầu "a" → vần "anh" (chuẩn hóa thành "ANH")
 */
function extractVowelPart(word) {
  const consonants = 'bcdfghjklmnpqrstvwxzđ';
  const vowelStarters = ['gi', 'qu', 'nh', 'ng', 'ph', 'th', 'tr', 'ch', 'kh', 'gh'];
  
  let normalized = word.toLowerCase();
  
  // Kiểm tra phụ âm ghép (GI, QU)
  for (const starter of vowelStarters) {
    if (normalized.startsWith(starter)) {
      const vowelPart = normalized.slice(starter.length);
      return { tp1: starter.toUpperCase(), vowelPart: vowelPart.toUpperCase() };
    }
  }
  
  // Kiểm tra phụ âm đơn
  if (consonants.includes(normalized[0])) {
    const vowelPart = normalized.slice(1);
    return { tp1: normalized[0].toUpperCase(), vowelPart: vowelPart.toUpperCase() };
  }
  
  // Bắt đầu bằng nguyên âm
  return { tp1: normalized[0].toUpperCase(), vowelPart: normalized.toUpperCase() };
}

/**
 * Chuẩn hóa vần để tra bảng (bỏ dấu thanh)
 */
function normalizeVowel(vowel) {
  const toneMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
  };
  
  return vowel.split('').map(ch => toneMap[ch] || ch).join('').toUpperCase();
}

/**
 * Sinh mã Cutter cho tên sách
 * @param {string} title - Tên sách
 * @returns {Promise<object>} { cutter, components }
 */
async function generateCutter(title) {
  if (!title || title.trim() === '') {
    throw { status: 400, code: 'EMPTY_TITLE', message: 'Tên sách không được để trống.' };
  }

  // Xử lý tên sách bắt đầu bằng số
  let processedTitle = title.trim();
  if (/^\d/.test(processedTitle)) {
    const numMatch = processedTitle.match(/^(\d+)/);
    if (numMatch) {
      const numText = numberToVietnamese(parseInt(numMatch[1]));
      processedTitle = numText + processedTitle.slice(numMatch[1].length);
    }
  }

  // Tách từ
  const words = processedTitle.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) {
    throw { status: 400, code: 'INVALID_TITLE', message: 'Tên sách không hợp lệ.' };
  }

  const firstWord = words[0];
  const secondWord = words.length > 1 ? words[1] : '';

  // Xử lý viết tắt (toàn bộ chữ hoa hoặc có dấu chấm)
  if (/^[A-ZĐ]+\./.test(firstWord) || /^[A-ZĐ]{2,}$/.test(firstWord)) {
    return {
      cutter: `${firstWord[0]}000${secondWord ? secondWord[0] : ''}`,
      components: { tp1: firstWord[0], tp2: '000', tp3: secondWord ? secondWord[0] : '' },
    };
  }

  // TP1: nguyên âm/phụ âm đầu
  const { tp1, vowelPart } = extractVowelPart(firstWord);

  // TP2: tra mã vần trong bảng Cutter
  const normalizedVowel = normalizeVowel(vowelPart);
  
  // Tra bảng — dùng supabase thay vì pool.query
  const { data: result } = await supabase
    .from('cutter_table')
    .select('code')
    .eq('vowel', normalizedVowel)
    .limit(1);

  let tp2;
  if (result && result.length > 0) {
    tp2 = result[0].code;
  } else {
    // Nếu không tìm thấy, fallback
    const first = normalizedVowel[0];
    const defaultCodes = { 'A': '100', 'E': '200', 'I': '300', 'O': '400', 'U': '500', 'Y': '600' };
    tp2 = defaultCodes[first] || '100';
  }

  // TP3: chữ cái đầu từ thứ hai
  let tp3 = secondWord ? secondWord[0].toUpperCase() : '';

  // Xử lý đặc biệt I và O
  let cutter;
  if (tp1 === 'I' || tp1 === 'O') {
    cutter = `${tp1}-${tp2}${tp3}`;
  } else {
    // Xử lý GI, QU giữ nguyên
    if (tp1 === 'GI' || tp1 === 'QU') {
      cutter = `${tp1}${tp2}${tp3}`;
    } else {
      cutter = `${tp1}${tp2}${tp3}`;
    }
  }

  return {
    cutter,
    components: { tp1, tp2, tp3 },
  };
}

module.exports = {
  generateCutter,
  extractVowelPart,
  normalizeVowel,
};
