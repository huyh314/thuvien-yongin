const https = require('https');
const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImage(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function generateDemoCovers() {
  const { supabase } = require('../config/database');
  const storageService = require('./storageService');

  const { data: books } = await supabase.from('bib_items').select('id, marc_record_id, cover_url, isbn');
  if (!books) return 0;

  let count = 0;
  for (const book of books) {
    if (book.cover_url) continue;

    try {
      let imageBuffer;
      const seed = book.id || 1;
      const url = `https://picsum.photos/seed/book${seed}/200/280`;
      imageBuffer = await fetchImage(url);

      if (imageBuffer && imageBuffer.length > 100) {
        await storageService.uploadCover(book.marc_record_id, imageBuffer, 'image/jpeg');
        count++;
        console.log(`✅ Cover #${book.id}: ${book.title}`);
      }
    } catch (e) {
      console.warn(`❌ Cover #${book.id}: ${e.message}`);
    }
  }

  console.log(`\nGenerated ${count} demo covers`);
  return count;
}

module.exports = { generateDemoCovers };
