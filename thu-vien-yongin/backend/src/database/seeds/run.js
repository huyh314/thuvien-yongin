/**
 * Seed script — chạy sau khi migrate để tạo dữ liệu mẫu
 * Usage: node src/database/seeds/run.js
 */
const bcrypt = require('bcryptjs');
const pool = require('../../config/database');

async function run() {
  console.log('🌱 Seeding database...\n');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ─── Roles ───
    await client.query(`INSERT INTO roles (name, description) VALUES
      ('admin', 'Quản trị hệ thống - toàn quyền'),
      ('librarian', 'Thủ thư - biên mục, lưu thông, quản lý kho')
      ON CONFLICT (name) DO NOTHING;`);

    // ─── Admin user (mật khẩu mặc định: admin123) ───
    const adminHash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (username, password_hash, full_name, email, role_id, status)
      VALUES ('admin', $1, 'Quản trị viên', 'admin@thuvienyongin.vn', 1, 'active')
      ON CONFLICT (username) DO NOTHING;`, [adminHash]);

    // ─── Librarian user (mật khẩu mặc định: lib123) ───
    const libHash = await bcrypt.hash('lib123', 10);
    await client.query(`
      INSERT INTO users (username, password_hash, full_name, email, role_id, status)
      VALUES ('librarian', $1, 'Thủ thư mặc định', 'librarian@thuvienyongin.vn', 2, 'active')
      ON CONFLICT (username) DO NOTHING;`, [libHash]);

    // ─── Permissions: Admin (toàn quyền tất cả) ───
    const modules = ['cataloging', 'circulation', 'patron', 'collection', 'report', 'admin', 'auth'];
    const actions = ['read', 'write', 'delete'];

    for (const mod of modules) {
      for (const act of actions) {
        await client.query(`
          INSERT INTO permissions (role_id, module, action, is_granted)
          VALUES (1, $1, $2, true)
          ON CONFLICT (role_id, module, action) DO NOTHING;`, [mod, act]);
      }
    }

    // ─── Permissions: Librarian (read + write, không delete) ───
    const libModules = ['cataloging', 'circulation', 'patron', 'collection', 'report'];
    for (const mod of libModules) {
      for (const act of ['read', 'write']) {
        await client.query(`
          INSERT INTO permissions (role_id, module, action, is_granted)
          VALUES (2, $1, $2, true)
          ON CONFLICT (role_id, module, action) DO NOTHING;`, [mod, act]);
      }
      // Librarian không được xóa
      await client.query(`
        INSERT INTO permissions (role_id, module, action, is_granted)
        VALUES (2, $1, 'delete', false)
        ON CONFLICT (role_id, module, action) DO NOTHING;`, [mod]);
    }

    await client.query('COMMIT');

    console.log('✅ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:     admin / admin123');
    console.log('🧑‍🏫 Librarian: librarian / lib123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
