import type { Item, Book } from './book';

export interface Patron {
  id: number;
  cardBarcode: string;
  fullName: string;
  idCard: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  patronType: 'adult' | 'child';
  maxCheckouts: number;
  maxDays: number;
  status: 'active' | 'suspended' | 'closed';
}

export interface Checkout {
  id: number;
  itemId: number;
  patronId: number;
  checkoutDate: string;
  dueDate: string;
  checkinDate: string | null;
  renewCount: number;
  status: 'active' | 'returned' | 'overdue';
  feeAmount: number;
  feePaid: boolean;
  item?: Item;
  patron?: Patron;
}

export interface CirculationStats {
  totalCheckouts: number;
  activeCheckouts: number;
  overdueCount: number;
  returnedToday: number;
  monthlyData: { date: string; count: number }[];
}
