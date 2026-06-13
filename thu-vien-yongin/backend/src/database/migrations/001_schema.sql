-- ═══════════════════════════════════════════════════════════════════
-- PHẦN MỀM THƯ VIỆN YONGIN — Database Schema (PostgreSQL)
-- Phiên bản: 1.1
-- Ngày: 06/2026
-- ═══════════════════════════════════════════════════════════════════

-- Cần pg_trgm cho cutter.js (tìm vần gần đúng)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ================================================================
-- 1. BẢNG DANH MỤC CHUẨN (Master Data)
-- ================================================================

-- Bảng mã Cutter (~80 vần)
CREATE TABLE cutter_table (
    id          SERIAL PRIMARY KEY,
    vowel       VARCHAR(10) NOT NULL UNIQUE,   -- vần: A, AC, ACH, AN, ANG...
    code        VARCHAR(3) NOT NULL UNIQUE,    -- mã số: 100, 101, 102...
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Bảng mã ngôn ngữ (~60 ngôn ngữ)
CREATE TABLE language_codes (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) NOT NULL UNIQUE,   -- vie, eng, fre, chi...
    name        VARCHAR(100) NOT NULL,          -- Tiếng Việt, English...
    name_native VARCHAR(100),                   -- Tiếng địa phương
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Bảng từ khóa TVQG
CREATE TABLE keywords (
    id          SERIAL PRIMARY KEY,
    term        VARCHAR(200) NOT NULL,
    type        VARCHAR(10) NOT NULL,           -- personal, corporate, subject, geographic, genre
    source      VARCHAR(20) DEFAULT 'TVQG',
    status      VARCHAR(10) DEFAULT 'active',   -- active, inactive
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(term, type)
);

-- Bảng vị trí giá sách
CREATE TABLE shelf_locations (
    id          SERIAL PRIMARY KEY,
    section     VARCHAR(100) NOT NULL,          -- Kho Mượn, Kho Đọc, Kho Thiếu nhi...
    row         VARCHAR(20),                    -- Giá số 1, Giá A...
    position    VARCHAR(20),                    -- Vị trí trên giá
    description TEXT,
    status      VARCHAR(20) DEFAULT 'active',   -- active, inactive
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(section, row, position)
);

-- ================================================================
-- 2. BẢNG PHÂN QUYỀN (RBAC)
-- ================================================================

-- Vai trò
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,    -- admin, librarian
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Quyền chi tiết
CREATE TABLE permissions (
    id          SERIAL PRIMARY KEY,
    role_id     INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module      VARCHAR(50) NOT NULL,           -- cataloging, circulation, patron, collection, report, admin, auth
    action      VARCHAR(20) NOT NULL,           -- read, write, delete
    is_granted  BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, module, action)
);

-- Người dùng hệ thống (Admin, Thủ thư)
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(200) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    email           VARCHAR(100),
    phone           VARCHAR(20),
    role_id         INT NOT NULL REFERENCES roles(id),
    status          VARCHAR(20) DEFAULT 'active',  -- active, suspended
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 3. BẢNG BIÊN MỤC MARC21
-- ================================================================

-- Biểu ghi MARC21
CREATE TABLE marc_records (
    id                  SERIAL PRIMARY KEY,
    leader              VARCHAR(24) NOT NULL,         -- 24 ký tự đầu biểu
    record_status       CHAR(1) DEFAULT 'n',          -- c=sửa, d=xóa, n=mới
    record_type         CHAR(1) DEFAULT 'a',          -- a=ngôn ngữ, e=bản đồ, m=tệp tin...
    bibliographic_level CHAR(1) DEFAULT 'm',          -- m=chuyên khảo, s=nhiều kỳ
    encoding_level      CHAR(1) DEFAULT '#',          -- #=đầy đủ
    cataloging_rules    CHAR(1) DEFAULT 'a',          -- a=AACR2
    raw_marc_xml        TEXT,                          -- lưu toàn bộ biểu ghi dạng XML
    created_by          INT REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Trường MARC21
CREATE TABLE marc_fields (
    id          SERIAL PRIMARY KEY,
    record_id   INT NOT NULL REFERENCES marc_records(id) ON DELETE CASCADE,
    tag         VARCHAR(3) NOT NULL,                  -- 020, 100, 245...
    ind1        CHAR(1) DEFAULT '#',                  -- chỉ thị 1
    ind2        CHAR(1) DEFAULT '#',                  -- chỉ thị 2
    field_order INT NOT NULL,                          -- thứ tự trong biểu ghi
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Subfield (trường con)
CREATE TABLE marc_subfields (
    id              SERIAL PRIMARY KEY,
    field_id        INT NOT NULL REFERENCES marc_fields(id) ON DELETE CASCADE,
    code            CHAR(1) NOT NULL,                 -- a, b, c, d...
    value           TEXT NOT NULL,
    subfield_order  INT NOT NULL,                     -- thứ tự subfield
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Đầu tài liệu (parse từ MARC21 để tìm kiếm nhanh)
CREATE TABLE bib_items (
    id              SERIAL PRIMARY KEY,
    marc_record_id  INT UNIQUE REFERENCES marc_records(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    title_search    VARCHAR(500),                     -- không dấu, lowercase
    author_main     VARCHAR(200),
    author_added    TEXT[],                            -- mảng tác giả phụ
    publisher_name  VARCHAR(200),
    publisher_place VARCHAR(100),
    publish_year    INT,
    isbn            VARCHAR(20),
    pages           VARCHAR(50),
    size_cm         VARCHAR(20),
    language_code   VARCHAR(10) DEFAULT 'vie',
    summary         TEXT,
    subjects        TEXT[],                            -- mảng từ khóa chủ đề
    series          VARCHAR(200),
    cover_url       VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Bản tài liệu vật lý
CREATE TABLE items (
    id              SERIAL PRIMARY KEY,
    bib_id          INT NOT NULL REFERENCES bib_items(id),
    dkcb            VARCHAR(30) UNIQUE NOT NULL,       -- số ĐKCB (VD: M.102568)
    barcode         VARCHAR(50) UNIQUE,                -- mã vạch
    rfid_tag        VARCHAR(50),                       -- RFID
    format          VARCHAR(20) DEFAULT 'book',        -- book, cd, digital
    shelf_section   VARCHAR(50),                       -- Kho Mượn, Kho Đọc...
    shelf_location  INT REFERENCES shelf_locations(id),
    status          VARCHAR(20) DEFAULT 'available',   -- available, checked_out, lost, discarded, pending_scan
    price           DECIMAL(12, 0),
    acquired_date   DATE,
    discarded_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 4. BẢNG BẠN ĐỌC
-- ================================================================

CREATE TABLE patrons (
    id              SERIAL PRIMARY KEY,
    card_barcode    VARCHAR(30) UNIQUE NOT NULL,       -- TV000123
    full_name       VARCHAR(200) NOT NULL,
    id_card         VARCHAR(20) UNIQUE,                -- CMND/CCCD
    dob             DATE,
    gender          VARCHAR(10),
    address         TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(100) UNIQUE,
    patron_type     VARCHAR(20) DEFAULT 'adult',       -- adult, child
    max_checkouts   INT DEFAULT 5,
    max_days        INT DEFAULT 30,
    fee_per_day     DECIMAL(10, 0) DEFAULT 5000,
    status          VARCHAR(20) DEFAULT 'active',      -- active, suspended, closed
    password_hash   VARCHAR(200),
    avatar_url      VARCHAR(500),
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Sách yêu thích
CREATE TABLE wishlist (
    id          SERIAL PRIMARY KEY,
    patron_id   INT NOT NULL REFERENCES patrons(id) ON DELETE CASCADE,
    bib_id      INT NOT NULL REFERENCES bib_items(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(patron_id, bib_id)
);

-- Đánh giá sách
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    patron_id   INT NOT NULL REFERENCES patrons(id) ON DELETE CASCADE,
    bib_id      INT NOT NULL REFERENCES bib_items(id) ON DELETE CASCADE,
    rating      INT CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(patron_id, bib_id)
);

-- ================================================================
-- 5. BẢNG LƯU THÔNG
-- ================================================================

CREATE TABLE circulation (
    id              SERIAL PRIMARY KEY,
    item_id         INT NOT NULL REFERENCES items(id),
    patron_id       INT NOT NULL REFERENCES patrons(id),
    checkout_date   DATE NOT NULL,
    due_date        DATE NOT NULL,
    checkin_date    DATE,
    renew_count     INT DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active',      -- active, returned, overdue
    fee_amount      DECIMAL(12, 0) DEFAULT 0,
    fee_paid        BOOLEAN DEFAULT FALSE,
    checkout_by     INT REFERENCES users(id),
    checkin_by      INT REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Đặt mượn trước
CREATE TABLE holds (
    id          SERIAL PRIMARY KEY,
    item_id     INT NOT NULL REFERENCES items(id),
    patron_id   INT NOT NULL REFERENCES patrons(id),
    hold_date   DATE NOT NULL,
    expiry_date DATE,
    status      VARCHAR(20) DEFAULT 'pending',         -- pending, ready, cancelled, fulfilled
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Phí phạt
CREATE TABLE fines (
    id              SERIAL PRIMARY KEY,
    circulation_id  INT REFERENCES circulation(id),
    patron_id       INT NOT NULL REFERENCES patrons(id),
    amount          DECIMAL(12, 0) NOT NULL,
    reason          VARCHAR(200),                       -- overdue, lost, damage
    status          VARCHAR(20) DEFAULT 'unpaid',       -- unpaid, paid, waived
    paid_date       DATE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 6. BẢNG KIỂM KÊ KHO
-- ================================================================

CREATE TABLE inventory_sessions (
    id          SERIAL PRIMARY KEY,
    started_by  INT REFERENCES users(id),
    completed_by INT REFERENCES users(id),
    start_date  TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date    TIMESTAMP,
    status      VARCHAR(20) DEFAULT 'in_progress',     -- in_progress, completed, cancelled
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_details (
    id              SERIAL PRIMARY KEY,
    session_id      INT NOT NULL REFERENCES inventory_sessions(id) ON DELETE CASCADE,
    item_id         INT NOT NULL REFERENCES items(id),
    barcode_scanned VARCHAR(50),
    scan_time       TIMESTAMP,
    found           BOOLEAN DEFAULT TRUE,              -- true=quét thấy, false=mất
    actual_shelf    INT REFERENCES shelf_locations(id),
    notes           TEXT,
    UNIQUE(session_id, item_id)
);

-- ================================================================
-- 7. BẢNG ADMIN & HỆ THỐNG
-- ================================================================

-- Nhật ký hoạt động
CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,                  -- create, update, delete, login...
    module      VARCHAR(50) NOT NULL,                  -- cataloging, circulation...
    entity_type VARCHAR(50),                           -- marc_record, bib_item, patron...
    entity_id   INT,                                   -- ID của bản ghi bị tác động
    old_value   JSONB,                                  -- giá trị cũ (nếu có)
    new_value   JSONB,                                  -- giá trị mới (nếu có)
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Cấu hình hệ thống
CREATE TABLE system_config (
    id          SERIAL PRIMARY KEY,
    key         VARCHAR(100) UNIQUE NOT NULL,          -- library_name, tvqg_api_url...
    value       TEXT NOT NULL,
    description TEXT,
    updated_by  INT REFERENCES users(id),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Tin tức, sự kiện
CREATE TABLE news (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    content     TEXT,
    image_url   VARCHAR(500),
    type        VARCHAR(20) DEFAULT 'news',            -- news, event
    start_date  DATE,
    end_date    DATE,
    status      VARCHAR(20) DEFAULT 'draft',           -- draft, published, archived
    created_by  INT REFERENCES users(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Thông báo
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    patron_id   INT REFERENCES patrons(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    type        VARCHAR(30),                            -- due_soon, overdue, book_available, new_book, event
    reference_type VARCHAR(50),                         -- circulation, hold, bib_item
    reference_id   INT,
    is_read     BOOLEAN DEFAULT FALSE,
    sent_at     TIMESTAMP DEFAULT NOW(),
    read_at     TIMESTAMP
);

-- Lịch sử tìm kiếm OPAC
CREATE TABLE search_logs (
    id          SERIAL PRIMARY KEY,
    patron_id   INT REFERENCES patrons(id) ON DELETE SET NULL,
    query       VARCHAR(500) NOT NULL,
    filters     JSONB,
    result_count INT,
    search_type VARCHAR(20) DEFAULT 'basic',            -- basic, advanced, fulltext
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 8. INDEXES
-- ================================================================

-- Marc records
CREATE INDEX idx_marc_fields_record_id ON marc_fields(record_id);
CREATE INDEX idx_marc_subfields_field_id ON marc_subfields(field_id);
CREATE INDEX idx_marc_fields_tag ON marc_fields(tag);

-- Bib items
CREATE INDEX idx_bib_items_title ON bib_items(title);
CREATE INDEX idx_bib_items_title_search ON bib_items(title_search);
CREATE INDEX idx_bib_items_author ON bib_items(author_main);
CREATE INDEX idx_bib_items_isbn ON bib_items(isbn);
CREATE INDEX idx_bib_items_publish_year ON bib_items(publish_year);
CREATE INDEX idx_bib_items_language ON bib_items(language_code);

-- Items
CREATE INDEX idx_items_bib_id ON items(bib_id);
CREATE INDEX idx_items_dkcb ON items(dkcb);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_shelf ON items(shelf_section);

-- Patrons
CREATE INDEX idx_patrons_card_barcode ON patrons(card_barcode);
CREATE INDEX idx_patrons_email ON patrons(email);
CREATE INDEX idx_patrons_id_card ON patrons(id_card);
CREATE INDEX idx_patrons_name ON patrons(full_name);
CREATE INDEX idx_patrons_phone ON patrons(phone);

-- Circulation
CREATE INDEX idx_circulation_item_id ON circulation(item_id);
CREATE INDEX idx_circulation_patron_id ON circulation(patron_id);
CREATE INDEX idx_circulation_status ON circulation(status);
CREATE INDEX idx_circulation_due_date ON circulation(due_date);
CREATE INDEX idx_circulation_dates ON circulation(checkout_date, due_date, checkin_date);

-- Holds
CREATE INDEX idx_holds_item_id ON holds(item_id);
CREATE INDEX idx_holds_patron_id ON holds(patron_id);
CREATE INDEX idx_holds_status ON holds(status);

-- Fines
CREATE INDEX idx_fines_patron_id ON fines(patron_id);
CREATE INDEX idx_fines_status ON fines(status);

-- Inventory
CREATE INDEX idx_inventory_session_id ON inventory_details(session_id);
CREATE INDEX idx_inventory_item_id ON inventory_details(item_id);

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Notifications
CREATE INDEX idx_notifications_patron_id ON notifications(patron_id);
CREATE INDEX idx_notifications_read ON notifications(patron_id, is_read);

-- Search logs
CREATE INDEX idx_search_logs_patron_id ON search_logs(patron_id);
CREATE INDEX idx_search_logs_created ON search_logs(created_at);

-- Keywords
CREATE INDEX idx_keywords_term ON keywords(term);
CREATE INDEX idx_keywords_type ON keywords(type);

-- ================================================================
-- 9. SEED DATA
-- ================================================================

-- Roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Quản trị hệ thống - toàn quyền'),
    ('librarian', 'Thủ thư - biên mục, lưu thông, quản lý kho');

-- Permissions for Admin (toàn quyền tất cả)
INSERT INTO permissions (role_id, module, action, is_granted)
SELECT r.id, m.module, a.action, true
FROM (SELECT id FROM roles WHERE name = 'admin') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report'), ('admin'), ('auth')) m(module)
CROSS JOIN (VALUES ('read'), ('write'), ('delete')) a(action);

-- Permissions for Librarian
INSERT INTO permissions (role_id, module, action, is_granted)
SELECT r.id, m.module, a.action, true
FROM (SELECT id FROM roles WHERE name = 'librarian') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report')) m(module)
CROSS JOIN (VALUES ('read'), ('write')) a(action)
UNION ALL
-- Librarian cannot delete
SELECT r.id, m.module, 'delete', false
FROM (SELECT id FROM roles WHERE name = 'librarian') r
CROSS JOIN (VALUES ('cataloging'), ('circulation'), ('patron'), ('collection'), ('report')) m(module);

-- System config defaults
INSERT INTO system_config (key, value, description) VALUES
    ('library_name', 'Thư viện số cộng đồng Yongin', 'Tên thư viện'),
    ('library_address', '46 Bạch Đằng, Hải Châu, Đà Nẵng', 'Địa chỉ thư viện'),
    ('library_phone', '0236xxxxxxx', 'Số điện thoại thư viện'),
    ('library_email', 'info@thuvienyongin.vn', 'Email thư viện'),
    ('marc_organization_code', 'TVDN', 'Mã MARC tổ chức'),
    ('default_language', 'vie', 'Ngôn ngữ mặc định'),
    ('default_classification', 'DDC 23', 'Khung phân loại mặc định'),
    ('cataloging_rules', 'AACR2', 'Quy tắc biên mục'),
    ('default_max_checkouts', '5', 'Số sách mượn tối đa mặc định'),
    ('default_loan_days', '30', 'Số ngày mượn mặc định'),
    ('overdue_fee_per_day', '5000', 'Phí quá hạn mỗi ngày (VNĐ)'),
    ('max_renew_count', '1', 'Số lần gia hạn tối đa'),
    ('tvqg_api_url', 'https://tvqg.gov.vn/api/', 'API Thư viện Quốc gia Việt Nam'),
    ('tvqg_enabled', 'false', 'Kết nối TVQG?');

-- Language codes (key ones)
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

-- Function: lấy số thẻ bạn đọc lớn nhất (cho generateCardBarcode)
CREATE OR REPLACE FUNCTION get_max_card_barcode()
RETURNS INT AS $$
  SELECT COALESCE(MAX(CAST(SUBSTRING(card_barcode FROM 3) AS INTEGER)), 0)
  FROM patrons WHERE card_barcode ~ '^TV[0-9]+$';
$$ LANGUAGE SQL;

-- Cutter table (all ~80 vowels)
INSERT INTO cutter_table (vowel, code) VALUES
    ('A', '100'), ('AC', '101'), ('ACH', '102'), ('AI', '103'),
    ('AM', '104'), ('AN', '105'), ('ANG', '106'), ('ANH', '107'),
    ('AO', '108'), ('AP', '109'), ('AT', '110'), ('AU', '111'),
    ('AY', '112'), ('ĂC', '113'), ('ĂM', '114'), ('ĂN', '115'),
    ('ĂNG', '116'), ('ĂP', '117'), ('ĂT', '118'),
    ('ÂC', '119'), ('ÂM', '120'), ('ÂN', '121'), ('ÂNG', '122'),
    ('ÂP', '123'), ('ÂT', '124'), ('ÂU', '125'), ('ÂY', '126'),
    ('E', '200'), ('EC', '201'), ('EM', '202'), ('EN', '203'),
    ('ENG', '204'), ('EO', '205'), ('EP', '206'), ('ET', '207'),
    ('Ê', '250'), ('ÊC', '251'), ('ÊCH', '252'), ('ÊM', '253'),
    ('ÊN', '254'), ('ÊNG', '255'), ('ÊNH', '256'), ('ÊP', '257'),
    ('ÊT', '258'), ('ÊU', '259'),
    ('I', '300'), ('IA', '301'), ('ICH', '302'), ('IÊC', '303'),
    ('IÊM', '304'), ('IÊN', '305'), ('IÊNG', '306'), ('IÊP', '307'),
    ('IÊT', '308'), ('IÊU', '309'), ('IM', '310'), ('IN', '311'),
    ('INH', '312'), ('IP', '313'), ('IT', '314'), ('IU', '315'),
    ('O', '400'), ('OA', '401'), ('OAC', '402'), ('OACH', '403'),
    ('OAI', '404'), ('OAM', '405'), ('OAN', '406'), ('OANG', '407'),
    ('OANH', '408'), ('OAO', '409'), ('OAP', '410'), ('OAT', '411'),
    ('Ô', '450'), ('ÔC', '451'), ('ÔI', '452'), ('ÔM', '453'),
    ('ÔN', '454'), ('ÔNG', '455'), ('ÔP', '457'), ('ÔT', '458'),
    ('U', '500'), ('UA', '501'), ('UÂN', '502'), ('UÂNG', '503'),
    ('UÂT', '504'), ('UC', '506'), ('UÊ', '507'),
    ('UI', '510'), ('UM', '511'), ('UN', '512'), ('UNG', '513'),
    ('UÔC', '514'), ('UÔI', '515'), ('UÔM', '516'), ('UÔN', '517'),
    ('UÔNG', '518'), ('UY', '523'),
    ('Ư', '550'), ('ƯA', '551'), ('ƯC', '552'), ('ƯI', '553'),
    ('ƯM', '554'), ('ƯN', '555'), ('ƯNG', '556'), ('ƯƠC', '557'),
    ('ƯƠI', '558'), ('ƯƠM', '559'), ('ƯƠN', '560'), ('ƯƠNG', '561'),
    ('ƯƠP', '562'), ('ƯƠT', '563'), ('ƯƠU', '564'), ('ƯT', '565'),
    ('ƯU', '566'),
    ('Y', '600'), ('YÊN', '603'), ('YÊU', '606');
