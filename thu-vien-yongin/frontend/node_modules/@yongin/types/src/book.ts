export interface Book {
  id: number;
  title: string;
  authorMain: string;
  isbn: string;
  publishYear: number;
  publisherName: string;
  pages: string;
  sizeCm: string;
  languageCode: string;
  summary: string;
  subjects: string[];
  coverUrl: string | null;
  totalCopies: number;
  availableCopies: number;
  isAvailable: boolean;
  rating: number;
}

export interface BibItem {
  id: number;
  marcRecordId: number;
  title: string;
  titleSearch: string;
  authorMain: string;
  authorAdded: string[];
  publisherName: string;
  publisherPlace: string;
  publishYear: number;
  isbn: string;
  pages: string;
  sizeCm: string;
  languageCode: string;
  summary: string;
  subjects: string[];
  series: string;
  coverUrl: string | null;
}

export interface Item {
  id: number;
  bibId: number;
  dkcb: string;
  barcode: string;
  rfidTag: string;
  format: string;
  shelfSection: string;
  shelfLocation: string;
  status: 'available' | 'checked_out' | 'lost' | 'discarded';
  price: number;
}
