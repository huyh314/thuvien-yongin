/**
 * Export MARC21 ISO 2709 format (.mrc)
 */

const FIELD_SEPARATOR   = String.fromCharCode(0x1E); // 0x1E
const SUBFIELD_SEPARATOR = String.fromCharCode(0x1F); // 0x1F

function exportIso2709(records) {
  const recordsOutput = [];

  for (const record of records) {
    const output = buildRecord(record);
    recordsOutput.push(output);
  }

  return Buffer.concat(recordsOutput);
}

function buildRecord(record) {
  const fieldData = [];
  const directory = [];

  if (!record.Fields && record.fields) record.Fields = record.fields;

  const fields = record.Fields || record.fields || [];

  for (const field of fields) {
    const tag = field.Tag || field.tag || '';
    if (!tag || tag.length !== 3) continue;
    const ind1 = (field.Ind1 || field.ind1 || '#').charAt(0);
    const ind2 = (field.Ind2 || field.ind2 || '#').charAt(0);

    let data = '';
    const subfields = field.Subfields || field.subfields || field.marc_subfields || [];
    for (const sf of subfields) {
      const code = sf.Code || sf.code || '';
      const value = sf.Value || sf.value || '';
      data += SUBFIELD_SEPARATOR + code + value;
    }
    if (tag.startsWith('00')) {
      data = (data.replace(new RegExp(SUBFIELD_SEPARATOR, 'g'), '') || field.value || '');
    } else {
      data = ind1 + ind2 + data;
    }
    data += FIELD_SEPARATOR;
    fieldData.push({ tag, data });
  }

  let offset = 0;
  for (const fd of fieldData) {
    directory.push({
      entry: fd.tag + fd.data.length.toString().padStart(4, '0') + offset.toString().padStart(5, '0'),
    });
    offset += fd.data.length;
  }

  const baseAddress = 24 + directory.length * 12 + 1;
  let leader = record.Leader || record.leader || '00869cam 2200265 a 4500';
  if (leader.length < 24) leader = leader.padEnd(24, ' ');

  const buf = Buffer.alloc(leader.length + '000'.length);
  buf.write(leader, 0);

  let pos = baseAddress;
  const dirStr = directory.map(d => d.entry).join('');
  const fullText = leader + dirStr + FIELD_SEPARATOR + fieldData.map(f => f.data).join('');
  return Buffer.from(fullText, 'utf-8');
}

module.exports = { exportIso2709 };
