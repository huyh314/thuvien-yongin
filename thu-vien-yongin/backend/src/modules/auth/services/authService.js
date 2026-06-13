const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../../config/database');
const config = require('../../../config');

const SALT_ROUNDS = 10;

/**
 * Đăng nhập
 */
async function login(username, password) {
  // Tìm user theo username — dùng supabase.from()
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, username, password_hash, full_name, email, status, last_login,
      role_id,
      roles!inner(name)
    `)
    .eq('username', username);

  if (error) {
    console.error('Login query error:', error.message);
    throw { status: 500, code: 'DB_ERROR', message: 'Lỗi truy vấn dữ liệu.' };
  }

  if (!users || users.length === 0) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
  }

  const user = users[0];

  if (user.status !== 'active') {
    throw { status: 401, code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Tên đăng nhập hoặc mật khẩu không đúng.' };
  }

  // Cập nhật last_login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      roleId: user.role_id,
      roleName: user.roles?.name || 'unknown',
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Đăng ký tài khoản mới (chỉ Admin)
 */
async function register(userData) {
  const { username, password, fullName, email, phone, roleId } = userData;

  // Kiểm tra username
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) {
    throw { status: 409, code: 'USERNAME_EXISTS', message: 'Tên đăng nhập đã tồn tại.' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      username,
      password_hash: passwordHash,
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      role_id: roleId || 2,
      status: 'active',
    })
    .select('id, username, full_name, email, phone, role_id, status, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw { status: 409, code: 'DUPLICATE', message: 'Tên đăng nhập đã tồn tại.' };
    }
    throw { status: 500, code: 'DB_ERROR', message: error.message };
  }

  return {
    id: newUser.id,
    username: newUser.username,
    fullName: newUser.full_name,
    email: newUser.email,
    phone: newUser.phone,
    roleId: newUser.role_id,
    status: newUser.status,
    createdAt: newUser.created_at,
  };
}

/**
 * Lấy thông tin user
 */
async function getProfile(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id, username, full_name, email, phone, status, last_login, created_at,
      role_id,
      roles!inner(name)
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw { status: 404, code: 'USER_NOT_FOUND', message: 'Người dùng không tồn tại.' };
  }

  // Lấy permissions
  const { data: permissions } = await supabase
    .from('permissions')
    .select('module, action, is_granted')
    .eq('role_id', user.role_id);

  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    roleId: user.role_id,
    roleName: user.roles?.name,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    permissions: permissions || [],
  };
}

/**
 * Làm mới token
 */
async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, username, status,
        role_id,
        roles!inner(name)
      `)
      .eq('id', decoded.userId)
      .single();

    if (error || !user || user.status !== 'active') {
      throw { status: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token không hợp lệ.' };
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err.status) throw err;
    throw { status: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token không hợp lệ hoặc đã hết hạn.' };
  }
}

// ─── Helper Functions ───

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: user.roles?.name,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

module.exports = { login, register, getProfile, refreshAccessToken };
