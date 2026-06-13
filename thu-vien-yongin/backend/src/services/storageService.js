const { supabase } = require('../config/database');

const BUCKET_NAME = 'book-covers';

async function ensureBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      console.log(`Storage bucket "${BUCKET_NAME}" created`);
    }
    return true;
  } catch (e) {
    console.warn('Storage bucket check failed:', e.message);
    return false;
  }
}

async function uploadCover(recordId, fileBuffer, mimeType) {
  const fileName = `cover_${recordId}.jpg`;
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, fileBuffer, {
    contentType: mimeType || 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  await supabase.from('bib_items').update({ cover_url: publicUrl }).eq('marc_record_id', recordId);

  return publicUrl;
}

async function deleteCover(recordId) {
  const fileName = `cover_${recordId}.jpg`;
  await supabase.storage.from(BUCKET_NAME).remove([fileName]);
  await supabase.from('bib_items').update({ cover_url: null }).eq('marc_record_id', recordId);
}

async function getCoverUrl(recordId) {
  const { data } = await supabase.from('bib_items').select('cover_url').eq('marc_record_id', recordId).maybeSingle();
  return data?.cover_url || null;
}

ensureBucket();

module.exports = { uploadCover, deleteCover, getCoverUrl };
