/**
 * MARC21 XML parser
 * 
 * Format:
 * <record xmlns="http://www.loc.gov/MARC21/slim">
 *   <leader>00869cam 2200265 a 4500</leader>
 *   <controlfield tag="001">M.102568</controlfield>
 *   <datafield tag="245" ind1="1" ind2="0">
 *     <subfield code="a">Văn hóa Việt Nam</subfield>
 *     <subfield code="c">Trần Quốc Vượng</subfield>
 *   </datafield>
 * </record>
 */

const { parseStringPromise } = require('xml2js');

async function parseMarcXml(xmlString) {
  const result = await parseStringPromise(xmlString, { explicitArray: false });
  const records = [];

  const collection = result.collection || result.record ? [result.record || result] : [];
  const entries = result.record || (result.collection?.record || []);
  for (const entry of (Array.isArray(entries) ? entries : [entries])) {
    const record = parseXmlRecord(entry);
    if (record) records.push(record);
  }

  return records;
}

function parseXmlRecord(entry) {
  if (!entry) return null;
  const fields = {};
  const record = entry.$ || entry;

  const leader = entry.leader || '00869cam 2200265 a 4500';
  const controlFields = entry.controlfield || [];
  const dataFields = entry.datafield || [];

  for (const cf of (Array.isArray(controlFields) ? controlFields : [controlFields])) {
    if (!cf || !cf.$) continue;
    const tag = cf.$.tag;
    fields[tag] = fields[tag] || [];
    fields[tag].push({ value: cf._, subfields: { a: cf._ } });
  }

  for (const df of (Array.isArray(dataFields) ? dataFields : [dataFields])) {
    if (!df || !df.$) continue;
    const tag = df.$.tag;
    const ind1 = df.$.ind1 || '#';
    const ind2 = df.$.ind2 || '#';
    const subfields = {};

    const sfs = Array.isArray(df.subfield) ? df.subfield : (df.subfield ? [df.subfield] : []);
    for (const sf of sfs) {
      if (!sf || !sf.$) continue;
      subfields[sf.$.code] = sf.$.code ? sf._ || '' : '';
    }

    fields[tag] = fields[tag] || [];
    fields[tag].push({ ind1, ind2, subfields });
  }

  return { leader, fields };
}

module.exports = { parseMarcXml };
