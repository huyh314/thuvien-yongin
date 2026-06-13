/**
 * Unit tests cho Auth module
 * 
 * Chạy: npm test
 * Yêu cầu: PostgreSQL đang chạy, database đã migrate
 */

const request = require('supertest');
const app = require('../../../app');
const pool = require('../../../config/database');

let adminToken;
let testUsername = `test_librarian_${Date.now()}`;

beforeAll(async () => {
  // Đăng nhập admin để lấy token (seed data cần có admin)
  try {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = res.body.accessToken;
  } catch (e) {
    console.warn('Không tìm thấy tài khoản admin mặc định. Bỏ qua test integration.');
  }
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/login', () => {
  test('Trả về 400 nếu thiếu username/password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('MISSING_FIELDS');
  });

  test('Trả về 401 nếu sai mật khẩu', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong_password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  test('Trả về token nếu đăng nhập đúng (nếu có admin)', async () => {
    if (!adminToken) return; // skip nếu không có admin
    expect(adminToken).toBeDefined();
    expect(typeof adminToken).toBe('string');
  });
});

describe('POST /api/auth/register', () => {
  test('Trả về 401 nếu không có token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: testUsername, password: 'test123', fullName: 'Test User' });
    expect(res.status).toBe(401);
  });

  test('Trả về 201 nếu admin tạo tài khoản (nếu có admin)', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: testUsername, password: 'test123', fullName: 'Test Librarian' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe(testUsername);
  });
});

describe('GET /api/auth/me', () => {
  test('Trả về 401 nếu không có token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('Trả về thông tin user nếu có token (nếu có admin)', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBeDefined();
    expect(res.body.permissions).toBeDefined();
  });
});

describe('POST /api/auth/refresh', () => {
  test('Trả về 400 nếu thiếu refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({});
    expect(res.status).toBe(400);
  });

  test('Trả về 401 nếu refreshToken sai', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid_token' });
    expect(res.status).toBe(401);
  });
});
