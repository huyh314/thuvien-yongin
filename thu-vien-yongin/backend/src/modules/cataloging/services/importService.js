const { supabase } = require('../../../config/database');
const { validateRow, validateMarc21Fields, validateIso2709Record } = require('../imports/validator');
const { parseIso2709 } = require('../imports/iso2709');
const { parseMarcXml } = require('../imports/marcxml');
const { parseCsv, parseExcel, csvRowToFields } = require('../imports/csvImporter');
const catalogingService = require('./catalogingService');

async function importFile(fileBuffer, format, userId) {
  let records = [];
  const errors = [];

  try {
    switch (format.toLowerCase()) {
      case 'iso2709':
      case 'mrc': {
        const parsed = parseIso2709(fileBuffer);
        for (const r of parsed) {
          const { valid, errors: errs } = validateIso2709Record(r);
          if (valid) records.push(r);
          else errors.push(...errs);
        }
        break;
      }
      case 'marcxml':
      case 'xml': {
        const parsed = await parseMarcXml(fileBuffer.toString('utf-8'));
        for (const r of parsed) {
          const { valid, errors: errs } = validateMarc21Fields(r.fields);
          if (valid) records.push(r);
          else errors.push(...errs);
        }
        break;
      }
      case 'csv': {
        const rows = parseCsv(fileBuffer);
        for (let i = 0; i < rows.length; i++) {
          const { valid, errors: errs } = validateRow(rows[i], i + 1);
          if (valid) {
            const fields = csvRowToFields(rows[i]);
            const { valid: fv, errors: ferr } = validateMarc21Fields(fields);
            if (fv) records.push({ fields });
            else errors.push(...ferr);
          } else {
            errors.push(...errs);
          }
        }
        break;
      }
      case 'excel':
      case 'xlsx': {
        const rows = parseExcel(fileBuffer);
        for (let i = 0; i < rows.length; i++) {
          const { valid, errors: errs } = validateRow(rows[i], i + 1);
          if (valid) {
            const fields = csvRowToFields(rows[i]);
            const { valid: fv, errors: ferr } = validateMarc21Fields(fields);
            if (fv) records.push({ fields });
            else errors.push(...ferr);
          } else {
            errors.push(...errs);
          }
        }
        break;
      }
      default:
        return { imported: 0, failed: 0, errors: [`Định dạng không hỗ trợ: ${format}`] };
    }

    let imported = 0;
    for (const record of records) {
      try {
        await catalogingService.createRecord(record.fields ? { fields: record.fields } : record, userId);
        imported++;
      } catch (e) {
        errors.push(`Lỗi tạo biểu ghi: ${e.message}`);
      }
    }

    return {
      imported,
      failed: errors.length,
      total: records.length,
      errors: errors.slice(0, 50),
    };
  } catch (e) {
    return { imported: 0, failed: 0, errors: [`Lỗi parse file: ${e.message}`] };
  }
}

module.exports = { importFile };
