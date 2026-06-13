/**
 * Export MARC21 XML format
 */

const { Builder } = require('xml2js');

async function exportMarcXml(records) {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ', newline: '\n' },
  });

  const xmlRecords = records.map(record => {
    const controlFields = [];
    const dataFields = [];

    const fields = record.Fields || record.fields || [];

    for (const field of fields) {
      const tag = field.Tag || field.tag || '';
      if (tag.startsWith('00')) {
        controlFields.push({
          $: { tag },
          _: field.value || field.subfields?.[0]?.value || '',
        });
      } else {
        const subfields = (field.Subfields || field.subfields || field.marc_subfields || []).map(sf => ({
          $: { code: sf.Code || sf.code || '' },
          _: sf.Value || sf.value || '',
        }));
        dataFields.push({
          $: { tag, ind1: field.Ind1 || field.ind1 || '#', ind2: field.Ind2 || field.ind2 || '#' },
          subfield: subfields,
        });
      }
    }

    return {
      $: { xmlns: 'http://www.loc.gov/MARC21/slim' },
      leader: record.Leader || record.leader || '00869cam 2200265 a 4500',
      controlfield: controlFields,
      datafield: dataFields,
    };
  });

  const xml = await builder.buildObject({ collection: { record: xmlRecords } });
  return xml;
}

module.exports = { exportMarcXml };
