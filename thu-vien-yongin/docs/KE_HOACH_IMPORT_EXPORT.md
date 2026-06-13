# 📥📤 KẾ HOẠCH CHI TIẾT — IMPORT/EXPORT BATCH

> Nhập/xuất hàng loạt MARC21, CSV, Excel — 2 tuần, 1 fullstack

---

## 1. KIẾN TRÚC

```
backend/src/modules/cataloging/
├── routes/catalogingRoutes.js     ← Thêm routes import/export
├── services/catalogingService.js  ← Thêm service functions
├── imports/
│   ├── iso2709.js                 ← Parse file .mrc (ISO 2709)
│   ├── marcxml.js                 ← Parse MARC21 XML
│   ├── csvImporter.js             ← Parse CSV/Excel
│   └── validator.js               ← Validate từng dòng
└── exports/
    ├── iso2709.js                 ← Export .mrc
    ├── marcxml.js                 ← Export MARC21 XML
    ├── excelExporter.js           ← Export .xlsx
    └── csvExporter.js             ← Export .csv
```

## 2. API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/cataloging/import` | Upload file (multipart) |
| POST | `/api/cataloging/import/preview` | Preview 10 dòng đầu |
| GET | `/api/cataloging/export` | Download file |

## 3. SPINT (2 TUẦN)

| Tuần | Công việc |
|------|-----------|
| W1 | Cài multer, tạo validator, ISO 2709 parser, MARC21 XML parser, CSV parser |
| W1 | API import: upload → validate → parse → insert |
| W2 | Export: ISO 2709, MARC21 XML, XLSX, CSV |
| W2 | API export, preview UI, test file lớn 1000+ records |
