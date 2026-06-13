import type { BibItem, Item } from './book';

export interface MarcRecord {
  id: number;
  leader: string;
  recordStatus: string;
  recordType: string;
  bibliographicLevel: string;
  fields: MarcField[];
  bibItem?: BibItem;
  items?: Item[];
}

export interface MarcField {
  id: number;
  tag: string;
  ind1: string;
  ind2: string;
  fieldOrder: number;
  marcSubfields: MarcSubfield[];
}

export interface MarcSubfield {
  code: string;
  value: string;
  subfieldOrder: number;
}
