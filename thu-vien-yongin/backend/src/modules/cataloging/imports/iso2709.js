/**
 * ISO 2709 / MARC21 Exchange Format parser
 * 
 * Cấu trúc file .mrc:
 *   Mỗi biểu ghi gồm: Leader (24 bytes) + Directory + Field separator + Data fields
 *   Kết thúc mỗi biểu ghi: ký tự Record Terminator (1D hex)
 * 
 * Leader: 00-04: record length, 05: status, 06: type, 07: biblio level
 * Directory: 12 byte per field: tag(3) + length(4) + offset(5) 
 *   kết thúc = Field Terminator (1E hex)
 * Fields: <data><1E>
 * Subfields: $a, $b, $c... = <1F><code><value>
 */

const ISO2709_SEPARATOR = String.fromCharCode(0x1D); // Record Terminator
const FIELD_SEPARATOR   = String.fromCharCode(0x1E); // Field Terminator
const SUBFIELD_SEPARATOR = String.fromCharCode(0x1F); // Delimiter

function parseIso2709(buffer) {
  const text = buffer.toString('utf-8');
  const records = [];
  const parts = text.split(ISO2709_SEPARATOR);

  for (const part of parts) {
    if (part.length < 24) continue;
    const record = parseRecord(part);
    if (record) records.push(record);
  }
  return records;
}

function parseRecord(text) {
  try {
    const leader = text.substring(0, 24);
    const baseAddress = parseInt(leader.substring(12, 17), 10);

    // Parse directory
    const dirEnd = text.indexOf(FIELD_SEPARATOR, 24);
    if (dirEnd === -1) return null;
    const directory = text.substring(24, dirEnd);

    const fields = {};
    for (let i = 0; i < directory.length; i += 12) {
      const tag = directory.substring(i, i + 3);
      const len = parseInt(directory.substring(i + 3, i + 7), 10);
      const off = baseAddress + parseInt(directory.substring(i + 7, i + 12), 10);

      if (tag === '00') continue;
      const data = text.substring(off, off + len);
      const subfields = parseSubfields(data);
      const ind1 = data.length >= 2 ? data.substring(0, 1).trim() || '#' : '#';
      const ind2 = data.length >= 3 ? data.substring(1, 2).trim() || '#' : '#';
      const sfStart = data.indexOf(SUBFIELD_SEPARATOR);
      const sfData = sfStart >= 0 ? data.substring(sfStart) : '';

      fields[tag] = fields[tag] || [];
      fields[tag].push({
        ind1, ind2,
        subfields: parseSubfieldsToObj(sfData),
      });
    }

    return { leader, fields, raw: text.substring(0, baseAddress + 100) };
  } catch (e) {
    return null;
  }
}

function parseSubfieldsToObj(text) {
  const obj = {};
  if (!text) return obj;
  const parts = text.split(SUBFIELD_SEPARATOR).filter(Boolean);
  for (const part of parts) {
    if (part.length >= 2) obj[part[0]] = part.substring(1).trim();
  }
  return obj;
}

function parseSubfields(text) {
  const result = [];
  if (!text) return result;
  const parts = text.split(SUBFIELD_SEPARATOR).filter(Boolean);
  for (const part of parts) {
    if (part.length >= 2) result.push({ code: part[0], value: part.substring(1).trim() });
  }
  return result;
}

module.exports = { parseIso2709 };
