-- ═══════════════════════════════════════════════════════════════════
-- PHẦN MỀM THƯ VIỆN YONGIN — Migration 002: Acquisition & Processing
-- ═══════════════════════════════════════════════════════════════════

-- Bảng Tiếp nhận (Acquisition)
CREATE TABLE IF NOT EXISTS acquisitions (
    id              SERIAL PRIMARY KEY,
    receipt_code    VARCHAR(30) UNIQUE NOT NULL,  -- PN-2026-001
    vendor          VARCHAR(200),
    received_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
    notes           TEXT,
    created_by      INT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Chi tiết từng đầu sách trong phiếu tiếp nhận
CREATE TABLE IF NOT EXISTS acquisition_items (
    id              SERIAL PRIMARY KEY,
    acquisition_id  INT REFERENCES acquisitions(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    author          VARCHAR(200),
    publisher       VARCHAR(200),
    publish_year    INT,
    isbn            VARCHAR(20),
    price           DECIMAL(12, 0),
    quantity        INT DEFAULT 1,
    received_qty    INT DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, received, rejected
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Thêm cột cho items: đóng dấu, ghi ĐKCB
ALTER TABLE items ADD COLUMN IF NOT EXISTS stamp_done BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS dkcb_date DATE;

-- Index
CREATE INDEX IF NOT EXISTS idx_acquisitions_status ON acquisitions(status);
CREATE INDEX IF NOT EXISTS idx_acquisitions_created_by ON acquisitions(created_by);
CREATE INDEX IF NOT EXISTS idx_acquisition_items_acquisition_id ON acquisition_items(acquisition_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_items_status ON acquisition_items(status);
