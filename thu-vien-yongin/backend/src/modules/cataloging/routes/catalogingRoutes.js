const express = require('express');
const router = express.Router();
const catalogingService = require('../services/catalogingService');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');

/**
 * POST /api/cataloging/records
 * Tạo biểu ghi MARC21 mới
 * Yêu cầu: Thủ thư trở lên
 */
router.post('/records', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const result = await catalogingService.createRecord(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Create record error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi tạo biểu ghi.' });
  }
});

/**
 * GET /api/cataloging/records/search
 * Tìm kiếm biểu ghi
 */
router.get('/records/search', async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'MISSING_QUERY', message: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }
    const result = await catalogingService.searchRecords(q, parseInt(page) || 1, parseInt(limit) || 20);
    return res.json(result);
  } catch (error) {
    console.error('Search records error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi tìm kiếm.' });
  }
});

/**
 * GET /api/cataloging/records/:id
 * Lấy chi tiết biểu ghi
 */
router.get('/records/:id', async (req, res) => {
  try {
    const result = await catalogingService.getRecord(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.code, message: error.message });
    }
    console.error('Get record error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * PUT /api/cataloging/records/:id
 * Cập nhật biểu ghi
 */
router.put('/records/:id', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const result = await catalogingService.updateRecord(parseInt(req.params.id), req.body, req.user.id);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Update record error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi cập nhật.' });
  }
});

/**
 * DELETE /api/cataloging/records/:id
 * Xóa biểu ghi (chỉ Admin)
 */
router.delete('/records/:id', authenticate, authorize('cataloging', 'delete'), async (req, res) => {
  try {
    const result = await catalogingService.deleteRecord(parseInt(req.params.id));
    return res.json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.code, message: error.message });
    }
    console.error('Delete record error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi xóa.' });
  }
});

/**
 * POST /api/cataloging/search-duplicate
 * Tra trùng biểu ghi
 */
router.post('/search-duplicate', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'MISSING_TITLE', message: 'Vui lòng nhập nhan đề tài liệu.' });
    }
    const result = await catalogingService.searchDuplicate(title, author || '', year);
    return res.json(result);
  } catch (error) {
    console.error('Search duplicate error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi tra trùng.' });
  }
});

/**
 * POST /api/cataloging/generate-cutter
 * Sinh mã Cutter tự động
 */
router.post('/generate-cutter', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'MISSING_TITLE', message: 'Vui lòng nhập tên sách.' });
    }
    const result = await catalogingService.generateCutter(title);
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error('Generate cutter error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi sinh mã Cutter.' });
  }
});

/**
 * POST /api/cataloging/suggest-ddc
 * Gợi ý chỉ số DDC dựa trên nhan đề + chủ đề
 */
router.post('/suggest-ddc', async (req, res) => {
  try {
    const { title, subject } = req.body;
    // Tra lookup đơn giản dựa trên từ khóa chủ đề
    const { data } = require('../../../config/database').supabase
      .from('bib_items')
      .select('subjects')
      .limit(50);
    
    // Map chủ đề → DDC gợi ý (lookup đơn giản)
    const ddcMap = {
      'văn hóa': { code: '332.6324', desc: 'Văn hóa' },
      'lịch sử': { code: '959.7', desc: 'Lịch sử Việt Nam' },
      'toán': { code: '510', desc: 'Toán học' },
      'vật lý': { code: '530', desc: 'Vật lý' },
      'hóa': { code: '540', desc: 'Hóa học' },
      'sinh': { code: '570', desc: 'Sinh học' },
      'kinh tế': { code: '330', desc: 'Kinh tế' },
      'triết': { code: '100', desc: 'Triết học' },
      'chính trị': { code: '320', desc: 'Chính trị' },
      'pháp luật': { code: '340', desc: 'Pháp luật' },
      'công nghệ': { code: '600', desc: 'Công nghệ' },
      'thiếu nhi': { code: '800', desc: 'Văn học thiếu nhi' },
      'văn học': { code: '800', desc: 'Văn học' },
      'tâm lý': { code: '150', desc: 'Tâm lý học' },
      'ngoại ngữ': { code: '420', desc: 'Ngoại ngữ' },
      'giáo dục': { code: '370', desc: 'Giáo dục' },
    };
    
    const suggestions = [];
    const searchStr = ((title || '') + ' ' + (subject || '')).toLowerCase();
    
    for (const [key, val] of Object.entries(ddcMap)) {
      if (searchStr.includes(key)) {
        suggestions.push(val);
      }
    }
    
    if (suggestions.length === 0) {
      suggestions.push({ code: '000', desc: 'Tổng quát' });
    }
    
    return res.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error('Suggest DDC error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/cataloging/keywords?q=
 * Tra cứu từ khóa TVQG
 */
router.get('/keywords', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ keywords: [] });
    }
    
    const { data } = require('../../../config/database').supabase
      .from('keywords')
      .select('term, type')
      .ilike('term', `%${q}%`)
      .limit(10);
    
    return res.json({ keywords: data || [] });
  } catch (error) {
    console.error('Keywords error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * POST /api/cataloging/import
 * Nhập hàng loạt biểu ghi (ISO 2709, MARC21 XML, CSV, Excel)
 */
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/import', authenticate, authorize('cataloging', 'write'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'Vui lòng chọn file để import.' });
    }
    const { format } = req.body;
    if (!format) {
      return res.status(400).json({ error: 'MISSING_FORMAT', message: 'Vui lòng chỉ định định dạng (iso2709|marcxml|csv|excel).' });
    }
    const importService = require('../services/importService');
    const result = await importService.importFile(req.file.buffer, format, req.user?.id || 1);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    console.error('Import error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống khi import.' });
  }
});

/**
 * POST /api/cataloging/records/:id/cover
 * Upload ảnh bìa sách
 */
router.post('/records/:id/cover', authenticate, authorize('cataloging', 'write'), upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE', message: 'Vui lòng chọn ảnh.' });
    const storageService = require('../../../services/storageService');
    const url = await storageService.uploadCover(req.params.id, req.file.buffer, req.file.mimetype);
    return res.json({ url, message: 'Upload ảnh bìa thành công.' });
  } catch (error) {
    console.error('Cover upload error:', error.message);
    return res.status(500).json({ error: 'UPLOAD_FAILED', message: error.message });
  }
});

/**
 * GET /api/cataloging/export
 * Xuất biểu ghi MARC21
 */
router.get('/export', authenticate, async (req, res) => {
  try {
    const { format, ids } = req.query;
    const exportService = require('../services/exportService');
    const idArray = ids ? ids.split(',').map(Number).filter(Boolean) : [];
    
    let data, contentType, filename;
    
    switch (format) {
      case 'marc':
        data = await exportService.exportMarcRecords(idArray);
        contentType = 'text/plain; charset=utf-8';
        filename = 'marc_export.mrc';
        break;
      case 'marcxml':
        data = await exportService.exportMarcXmlRecords(idArray);
        contentType = 'application/xml; charset=utf-8';
        filename = 'marc_export.xml';
        break;
      case 'dc':
        data = await exportService.exportDublinCore(idArray);
        contentType = 'application/xml; charset=utf-8';
        filename = 'dublin_core.xml';
        break;
      case 'csv':
        data = await exportService.exportRecords('csv', idArray).then(r => r.buffer.toString('utf-8'));
        contentType = 'text/csv; charset=utf-8';
        filename = 'yongin_catalog.csv';
        break;
      case 'excel':
      case 'xlsx':
        data = await exportService.exportRecords('excel', idArray).then(r => r.buffer);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'yongin_catalog.xlsx';
        break;
      default:
        return res.status(400).json({ error: 'INVALID_FORMAT', message: 'Format: marc, marcxml, dc, csv, excel' });
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(data);
  } catch (error) {
    console.error('Export error:', error.message);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * GET /api/cataloging/tvqg/search?q=
 * Tra cứu biểu ghi từ TVQG
 */
router.get('/tvqg/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'MISSING_QUERY', message: 'Nhập từ khóa.' });
    const tvqg = require('../../../config/tvqg');
    const results = await tvqg.searchRecords(q);
    return res.json(results);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

/**
 * POST /api/cataloging/tvqg/import/:id
 * Tải biểu ghi từ TVQG về
 */
router.post('/tvqg/import/:id', authenticate, authorize('cataloging', 'write'), async (req, res) => {
  try {
    const tvqg = require('../../../config/tvqg');
    const result = await tvqg.importRecord(req.params.id, req.user.id);
    return res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.code, message: error.message });
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Lỗi hệ thống.' });
  }
});

module.exports = router;
