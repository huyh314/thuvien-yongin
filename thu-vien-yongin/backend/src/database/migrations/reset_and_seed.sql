-- ═══════════════════════════════════════════════════════════════════
-- RESET + SEED — Xóa hết rồi tạo lại toàn bộ
-- ═══════════════════════════════════════════════════════════════════

-- Tắt trigger kiểm tra khóa ngoại tạm thời
SET session_replication_role = 'replica';

-- Xóa toàn bộ dữ liệu (đúng thứ tự để không lỗi FK)
TRUNCATE TABLE
  search_logs, notifications, news, audit_logs,
  inventory_details, inventory_sessions,
  fines, holds, circulation,
  reviews, wishlist,
  items, bib_items,
  marc_subfields, marc_fields, marc_records,
  patrons, users, permissions,
  shelf_locations, keywords, language_codes, cutter_table,
  system_config, roles
RESTART IDENTITY CASCADE;

-- Bật lại trigger
SET session_replication_role = 'origin';

-- ================================================================
-- SEED DATA
-- ================================================================

-- 1. Roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Quản trị hệ thống - toàn quyền'),
    ('librarian', 'Thủ thư - biên mục, lưu thông, quản lý kho');

-- 2. Permissions — Admin toàn quyền tất cả
INSERT INTO permissions (role_id, module, action, is_granted)
SELECT r.id, m.module, a.action, true
FROM (SELECT id FROM roles WHERE name = 'admin') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report'), ('admin'), ('auth')) m(module)
CROSS JOIN (VALUES ('read'), ('write'), ('delete')) a(action);

-- 3. Permissions — Librarian (read + write, không delete)
INSERT INTO permissions (role_id, module, action, is_granted)
SELECT r.id, m.module, a.action, true
FROM (SELECT id FROM roles WHERE name = 'librarian') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report')) m(module)
CROSS JOIN (VALUES ('read'), ('write')) a(action);

INSERT INTO permissions (role_id, module, action, is_granted)
SELECT r.id, m.module, 'delete', false
FROM (SELECT id FROM roles WHERE name = 'librarian') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report')) m(module);

-- 4. Admin user (password: admin123)
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (username, password_hash, full_name, email, role_id, status)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Quản trị viên', 'admin@thuvienyongin.vn', 1, 'active');

-- 5. Librarian user (password: lib123)
INSERT INTO users (username, password_hash, full_name, email, role_id, status)
VALUES ('librarian', '$2a$10$k2s3q8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Thủ thư mặc định', 'librarian@thuvienyongin.vn', 2, 'active');

-- 6. System config
INSERT INTO system_config (key, value, description) VALUES
    ('library_name', 'Thư viện số cộng đồng Yongin', 'Tên thư viện'),
    ('library_address', '46 Bạch Đằng, Hải Châu, Đà Nẵng', 'Địa chỉ thư viện'),
    ('library_phone', '0236xxxxxxx', 'Số điện thoại'),
    ('library_email', 'info@thuvienyongin.vn', 'Email'),
    ('marc_organization_code', 'TVDN', 'Mã MARC tổ chức'),
    ('default_language', 'vie', 'Ngôn ngữ mặc định'),
    ('default_classification', 'DDC 23', 'Khung phân loại mặc định'),
    ('cataloging_rules', 'AACR2', 'Quy tắc biên mục'),
    ('default_max_checkouts', '5', 'Số sách mượn tối đa'),
    ('default_loan_days', '30', 'Số ngày mượn'),
    ('overdue_fee_per_day', '5000', 'Phí quá hạn/ngày'),
    ('max_renew_count', '1', 'Số lần gia hạn tối đa'),
    ('tvqg_api_url', 'https://tvqg.gov.vn/api/', 'API TVQG'),
    ('tvqg_enabled', 'false', 'Kết nối TVQG?');

-- 7. Language codes
INSERT INTO language_codes (code, name) VALUES
    ('vie', 'Tiếng Việt'),
    ('eng', 'Tiếng Anh'),
    ('fre', 'Tiếng Pháp'),
    ('ger', 'Tiếng Đức'),
    ('rus', 'Tiếng Nga'),
    ('chi', 'Tiếng Trung Quốc'),
    ('jpn', 'Tiếng Nhật'),
    ('kor', 'Tiếng Hàn'),
    ('lao', 'Tiếng Lào'),
    ('tha', 'Tiếng Thái'),
    ('spa', 'Tiếng Tây Ban Nha'),
    ('por', 'Tiếng Bồ Đào Nha'),
    ('ita', 'Tiếng Ý'),
    ('dut', 'Tiếng Hà Lan'),
    ('mul', 'Đa ngôn ngữ');

-- 8. Cutter table (full ~80 vowels)
INSERT INTO cutter_table (vowel, code) VALUES
    ('A','100'),('AC','101'),('ACH','102'),('AI','103'),('AM','104'),('AN','105'),('ANG','106'),('ANH','107'),('AO','108'),('AP','109'),('AT','110'),('AU','111'),('AY','112'),
    ('ĂC','113'),('ĂM','114'),('ĂN','115'),('ĂNG','116'),('ĂP','117'),('ĂT','118'),
    ('ÂC','119'),('ÂM','120'),('ÂN','121'),('ÂNG','122'),('ÂP','123'),('ÂT','124'),('ÂU','125'),('ÂY','126'),
    ('E','200'),('EC','201'),('EM','202'),('EN','203'),('ENG','204'),('EO','205'),('EP','206'),('ET','207'),
    ('Ê','250'),('ÊC','251'),('ÊCH','252'),('ÊM','253'),('ÊN','254'),('ÊNG','255'),('ÊNH','256'),('ÊP','257'),('ÊT','258'),('ÊU','259'),
    ('I','300'),('IA','301'),('ICH','302'),('IÊC','303'),('IÊM','304'),('IÊN','305'),('IÊNG','306'),('IÊP','307'),('IÊT','308'),('IÊU','309'),
    ('IM','310'),('IN','311'),('INH','312'),('IP','313'),('IT','314'),('IU','315'),
    ('O','400'),('OA','401'),('OAC','402'),('OACH','403'),('OAI','404'),('OAM','405'),('OAN','406'),('OANG','407'),('OANH','408'),('OAO','409'),('OAP','410'),('OAT','411'),
    ('Ô','450'),('ÔC','451'),('ÔI','452'),('ÔM','453'),('ÔN','454'),('ÔNG','455'),('ÔP','457'),('ÔT','458'),
    ('U','500'),('UA','501'),('UÂN','502'),('UÂNG','503'),('UÂT','504'),('UC','506'),('UÊ','507'),
    ('UI','510'),('UM','511'),('UN','512'),('UNG','513'),('UÔC','514'),('UÔI','515'),('UÔM','516'),('UÔN','517'),('UÔNG','518'),('UY','523'),
    ('Ư','550'),('ƯA','551'),('ƯC','552'),('ƯI','553'),('ƯM','554'),('ƯN','555'),('ƯNG','556'),('ƯƠC','557'),('ƯƠI','558'),('ƯƠM','559'),('ƯƠN','560'),('ƯƠNG','561'),('ƯƠP','562'),('ƯƠT','563'),('ƯƠU','564'),('ƯT','565'),('ƯU','566'),
    ('Y','600'),('YÊN','603'),('YÊU','606');

-- 9. Tạo function cho generateCardBarcode
CREATE OR REPLACE FUNCTION get_max_card_barcode()
RETURNS INT AS $$
  SELECT COALESCE(MAX(CAST(SUBSTRING(card_barcode FROM 3) AS INTEGER)), 0)
  FROM patrons WHERE card_barcode ~ '^TV[0-9]+$';
$$ LANGUAGE SQL;

-- 10. Thêm dữ liệu mẫu: Shelf locations
INSERT INTO shelf_locations (section, row, position) VALUES
    ('Kho Mượn', 'A', '1'), ('Kho Mượn', 'A', '2'), ('Kho Mượn', 'B', '1'),
    ('Kho Đọc', 'A', '1'), ('Kho Đọc', 'B', '1'),
    ('Kho Thiếu nhi', 'A', '1'), ('Kho Thiếu nhi', 'A', '2');

-- Báo cáo kết quả
SELECT '✅ RESET + SEED completed!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
