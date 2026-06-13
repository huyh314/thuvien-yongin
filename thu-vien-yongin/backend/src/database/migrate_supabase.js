/**
 * Migration script for Supabase
 * 
 * Cách dùng:
 *   CÁCH 1 — Tự động (cần SUPABASE_DATABASE_URL trong .env):
 *     node src/database/migrate_supabase.js
 *   
 *   CÁCH 2 — Thủ công:
 *     Vào Supabase Dashboard → SQL Editor → paste nội dung file 
 *     src/database/migrations/001_schema.sql → Run
 * 
 * Lấy SUPABASE_DATABASE_URL:
 *   Supabase Dashboard → Project Settings → Database → Connection string → URI
 *   Copy và thêm vào .env: SUPABASE_DATABASE_URL=postgresql://...
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const dbUrl = process.env.SUPABASE_DATABASE_URL;

  if (!dbUrl) {
    console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║  📋 CÁCH 1: Dùng Supabase SQL Editor (khuyên dùng)        ║
  ╚══════════════════════════════════════════════════════════════╝

  1. Vào https://supabase.com/dashboard/project/qtvofbptqnopmlqegnkw
  2. Vào SQL Editor → New Query
  3. Copy nội dung file sau và paste vào:
     src/database/migrations/001_schema.sql
  4. Chạy (Ctrl+Enter)
  
  ╔══════════════════════════════════════════════════════════════╗
  ║  📋 CÁCH 2: Thêm SUPABASE_DATABASE_URL vào .env           ║
  ╚══════════════════════════════════════════════════════════════╝

  Lấy từ: Supabase Dashboard → Project Settings → Database
  → Connection string → URI
  Thêm vào .env: SUPABASE_DATABASE_URL=postgresql://...
  Rồi chạy lại lệnh này.
    `);
    process.exit(1);
  }

  // Nếu có DB URL thì chạy tự động
  const { Client } = require('pg');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    const sqlPath = path.join(__dirname, 'migrations', '001_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');
    console.log('🎉 21 tables created with seed data!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
