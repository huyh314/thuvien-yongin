const axios = require('axios');

const TVQG_BASE = process.env.TVQG_API_URL || 'https://opac.nlv.gov.vn/api';

async function searchRecords(query) {
  try {
    const { data } = await axios.get(`${TVQG_BASE}/search`, { params: { q: query, limit: 20 }, timeout: 10000 });
    return data?.records || data?.results || [];
  } catch (e) {
    console.warn('TVQG search failed:', e.message);
    return [];
  }
}

async function importRecord(tvqgId, userId) {
  try {
    const { data } = await axios.get(`${TVQG_BASE}/records/${tvqgId}`, { timeout: 10000 });
    if (!data || !data.fields) throw new Error('Invalid TVQG response');
    const catalogingService = require('../modules/cataloging/services/catalogingService');
    return await catalogingService.createRecord({ fields: data.fields }, userId || 1);
  } catch (e) {
    console.error('TVQG import failed:', e.message);
    throw { status: 500, code: 'TVQG_IMPORT_FAILED', message: 'Không thể tải biểu ghi từ TVQG.' };
  }
}

module.exports = { searchRecords, importRecord };
