/**
 * patronService.js — Chuyển sang Supabase
 * 
 * Thay thế hoàn toàn file services/patronService.js cũ
 * Đổi tên file này thành patronService.js khi sẵn sàng
 * 
 * Thay đổi chính:
 *   const pool = require('.../database')  →  const { supabase } = require('.../supabase')
 *   pool.query(...)                       →  supabase.from(...).select(...)
 *   result.rows                           →  data
 *   result.rows[0]                        →  data (sau .single() hoặc .maybeSingle())
 *   throw { status, code, message }       →  giữ nguyên
 *   transaction (BEGIN/COMMIT)             →  supabase.rpc() hoặc pg pool song song
 */
const { supabase, findById } = require('../../../config/supabase');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Tự động sinh mã thẻ bạn đọc
 */
async function generateCardBarcode() {
  // Supabase: dùng raw query vì cần SUBSTRING + regex
  const { data, error } = await supabase.rpc('get_max_card_barcode');
  if (error) {
    // Fallback: query bằng Supabase API
    const { data: patrons } = await supabase
      .from('patrons')
      .select('card_barcode')
      .like('card_barcode', 'TV%')
      .order('card_barcode', { ascending: false })
      .limit(1);
    
    const maxNum = patrons && patrons.length > 0
      ? parseInt(patrons[0].card_barcode.replace('TV', '')) || 0
      : 0;
    const nextNum = maxNum + 1;
    return `TV${String(nextNum).padStart(6, '0')}`;
  }
  const nextNum = (data || 0) + 1;
  return `TV${String(nextNum).padStart(6, '0')}`;
}

/**
 * Đăng ký bạn đọc mới
 */
async function register(data) {
  const { fullName, idCard, dob, gender, address, phone, email, password } = data;

  // Kiểm tra email
  if (email) {
    const { data: existingEmail } = await supabase
      .from('patrons')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingEmail) {
      throw { status: 409, code: 'EMAIL_EXISTS', message: 'Email đã được sử dụng.' };
    }
  }

  // Kiểm tra CMND
  if (idCard) {
    const { data: existingIdCard } = await supabase
      .from('patrons')
      .select('id')
      .eq('id_card', idCard)
      .maybeSingle();
    if (existingIdCard) {
      throw { status: 409, code: 'ID_CARD_EXISTS', message: 'Số CMND/CCCD đã được đăng ký.' };
    }
  }

  // Sinh mã thẻ
  const cardBarcode = await generateCardBarcode();

  // Hash password
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  // Insert
  const { data: newPatron, error } = await supabase
    .from('patrons')
    .insert({
      card_barcode: cardBarcode,
      full_name: fullName,
      id_card: idCard || null,
      dob: dob || null,
      gender: gender || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      patron_type: data.patronType || 'adult',
      max_checkouts: 5,
      max_days: 30,
      fee_per_day: 5000,
      status: 'active',
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw { status: 409, code: 'DUPLICATE', message: 'Thông tin đã tồn tại.' };
    }
    throw { status: 500, code: 'DB_ERROR', message: error.message };
  }

  return newPatron;
}

/**
 * Đăng nhập cho bạn đọc
 */
async function login(emailOrBarcode, password) {
  const { data: patron, error } = await supabase
    .from('patrons')
    .select('id, card_barcode, full_name, email, password_hash, status')
    .or(`email.eq.${emailOrBarcode},card_barcode.eq.${emailOrBarcode}`)
    .maybeSingle();

  if (!patron) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Email/mã thẻ hoặc mật khẩu không đúng.' };
  }

  if (patron.status !== 'active') {
    throw { status: 401, code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa.' };
  }

  if (!patron.password_hash) {
    throw { status: 401, code: 'NO_PASSWORD', message: 'Tài khoản chưa đặt mật khẩu. Vui lòng đến quầy thủ thư.' };
  }

  const isValid = await bcrypt.compare(password, patron.password_hash);
  if (!isValid) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Email/mã thẻ hoặc mật khẩu không đúng.' };
  }

  // Cập nhật last_login
  await supabase
    .from('patrons')
    .update({ last_login: new Date().toISOString() })
    .eq('id', patron.id);

  return {
    id: patron.id,
    cardBarcode: patron.card_barcode,
    fullName: patron.full_name,
    email: patron.email,
    status: patron.status,
  };
}

/**
 * Tìm kiếm bạn đọc
 */
async function search(query, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const searchPattern = `%${query}%`;

  const { data: results, count, error } = await supabase
    .from('patrons')
    .select('id, card_barcode, full_name, id_card, dob, gender, phone, email, patron_type, status, created_at', { count: 'exact' })
    .or(`full_name.ilike.${searchPattern},card_barcode.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
    .order('full_name')
    .range(offset, offset + limit - 1);

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  // Đếm active_checkouts cho mỗi patron
  const enrichedResults = await Promise.all(results.map(async (patron) => {
    const { count: activeCheckouts } = await supabase
      .from('circulation')
      .select('id', { count: 'exact', head: true })
      .eq('patron_id', patron.id)
      .eq('status', 'active');
    return { ...patron, active_checkouts: activeCheckouts || 0 };
  }));

  return {
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    results: enrichedResults,
  };
}

/**
 * Lấy thông tin bạn đọc
 */
async function getProfile(patronId) {
  const { data: patron, error } = await supabase
    .from('patrons')
    .select('*')
    .eq('id', patronId)
    .single();

  if (error || !patron) {
    throw { status: 404, code: 'PATRON_NOT_FOUND', message: 'Không tìm thấy bạn đọc.' };
  }

  // Đếm active + overdue
  const { count: activeCheckouts } = await supabase
    .from('circulation')
    .select('id', { count: 'exact', head: true })
    .eq('patron_id', patronId)
    .eq('status', 'active');

  const { count: overdueCount } = await supabase
    .from('circulation')
    .select('id', { count: 'exact', head: true })
    .eq('patron_id', patronId)
    .eq('status', 'active')
    .lt('due_date', new Date().toISOString().split('T')[0]);

  return {
    ...patron,
    active_checkouts: activeCheckouts || 0,
    overdue_count: overdueCount || 0,
  };
}

/**
 * Cập nhật thông tin
 */
async function updateProfile(patronId, data) {
  const updates = {};
  if (data.fullName) updates.full_name = data.fullName;
  if (data.address) updates.address = data.address;
  if (data.phone) updates.phone = data.phone;
  if (data.email) updates.email = data.email;
  if (data.gender) updates.gender = data.gender;
  if (data.dob) updates.dob = data.dob;
  updates.updated_at = new Date().toISOString();

  const { data: patron, error } = await supabase
    .from('patrons')
    .update(updates)
    .eq('id', patronId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw { status: 409, code: 'DUPLICATE', message: 'Email hoặc CMND đã tồn tại.' };
    }
    throw { status: 500, code: 'DB_ERROR', message: error.message };
  }
  if (!patron) {
    throw { status: 404, code: 'PATRON_NOT_FOUND', message: 'Không tìm thấy bạn đọc.' };
  }

  return patron;
}

/**
 * Lịch sử mượn/trả
 */
async function getHistory(patronId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { count } = await supabase
    .from('circulation')
    .select('id', { count: 'exact', head: true })
    .eq('patron_id', patronId);

  const { data, error } = await supabase
    .from('circulation')
    .select(`
      id, checkout_date, due_date, checkin_date, status,
      renew_count, fee_amount, fee_paid,
      items!inner(
        dkcb, barcode,
        bib_items!inner(title, author_main, isbn, cover_url, subjects)
      )
    `)
    .eq('patron_id', patronId)
    .order('checkout_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  const today = new Date().toISOString().split('T')[0];
  const results = (data || []).map((c) => ({
    id: c.id,
    checkout_date: c.checkout_date,
    due_date: c.due_date,
    checkin_date: c.checkin_date,
    status: c.status,
    renew_count: c.renew_count,
    fee_amount: c.fee_amount,
    fee_paid: c.fee_paid,
    dkcb: c.items?.dkcb,
    barcode: c.items?.barcode,
    title: c.items?.bib_items?.title,
    author_main: c.items?.bib_items?.author_main,
    isbn: c.items?.bib_items?.isbn,
    cover_url: c.items?.bib_items?.cover_url,
    subjects: c.items?.bib_items?.subjects,
    is_overdue: c.status === 'active' && c.due_date < today,
  }));

  return {
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    results,
  };
}

/**
 * Thẻ thư viện số (QR)
 */
async function getCardData(patronId) {
  const patron = await findById('patrons', patronId);
  if (!patron) {
    throw { status: 404, code: 'PATRON_NOT_FOUND', message: 'Không tìm thấy bạn đọc.' };
  }

  return {
    cardBarcode: patron.card_barcode,
    fullName: patron.full_name,
    patronType: patron.patron_type,
    status: patron.status,
    issuedAt: patron.created_at,
    qrData: JSON.stringify({
      type: 'library_card',
      cardBarcode: patron.card_barcode,
      name: patron.full_name,
    }),
    libraryName: process.env.LIBRARY_NAME || 'Thư viện số cộng đồng Yongin',
  };
}

/**
 * Danh sách yêu thích
 */
async function getWishlist(patronId) {
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id, created_at,
      bib_items!inner(
        id, title, author_main, isbn, cover_url,
        publish_year, publisher_name, subjects
      )
    `)
    .eq('patron_id', patronId)
    .order('created_at', { ascending: false });

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  const results = await Promise.all((data || []).map(async (w) => {
    const { count } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('bib_id', w.bib_items.id)
      .eq('status', 'available');

    return {
      id: w.id,
      added_at: w.created_at,
      bib_id: w.bib_items.id,
      title: w.bib_items.title,
      author_main: w.bib_items.author_main,
      isbn: w.bib_items.isbn,
      cover_url: w.bib_items.cover_url,
      publish_year: w.bib_items.publish_year,
      publisher_name: w.bib_items.publisher_name,
      subjects: w.bib_items.subjects,
      available_copies: count || 0,
    };
  }));

  return results;
}

/**
 * Thêm vào yêu thích
 */
async function addToWishlist(patronId, bibId) {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('patron_id', patronId)
    .eq('bib_id', bibId)
    .maybeSingle();

  if (existing) {
    return { message: 'Sách đã có trong danh sách yêu thích.', id: existing.id };
  }

  const { data, error } = await supabase
    .from('wishlist')
    .insert({ patron_id: patronId, bib_id: bibId })
    .select()
    .single();

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  return { message: 'Đã thêm vào yêu thích.', id: data.id };
}

/**
 * Xóa khỏi yêu thích
 */
async function removeFromWishlist(patronId, bibId) {
  const { data, error } = await supabase
    .from('wishlist')
    .delete()
    .eq('patron_id', patronId)
    .eq('bib_id', bibId)
    .select();

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };
  if (!data || data.length === 0) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Không tìm thấy trong danh sách yêu thích.' };
  }
  return { message: 'Đã xóa khỏi danh sách yêu thích.' };
}

/**
 * Lấy thông báo
 */
async function getNotifications(patronId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('patron_id', patronId);

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('patron_id', patronId)
    .order('sent_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw { status: 500, code: 'DB_ERROR', message: error.message };

  const unreadCount = (data || []).filter(n => !n.is_read).length;

  return {
    total: count || 0,
    page,
    limit,
    unread: unreadCount,
    results: data || [],
  };
}

/**
 * Đánh dấu đã đọc
 */
async function markNotificationRead(notificationId) {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  return { message: 'Đã đánh dấu đã đọc.' };
}

/**
 * Tạo function get_max_card_barcode trong Supabase SQL Editor:
 * 
 * CREATE OR REPLACE FUNCTION get_max_card_barcode()
 * RETURNS INT AS $$
 *   SELECT COALESCE(MAX(CAST(SUBSTRING(card_barcode FROM 3) AS INTEGER)), 0)
 *   FROM patrons WHERE card_barcode ~ '^TV[0-9]+$';
 * $$ LANGUAGE SQL;
 */

module.exports = {
  register, login, search, getProfile, updateProfile,
  getHistory, getCardData, getWishlist,
  addToWishlist, removeFromWishlist,
  getNotifications, markNotificationRead,
};
