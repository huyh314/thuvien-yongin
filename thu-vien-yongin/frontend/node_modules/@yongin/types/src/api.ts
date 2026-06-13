export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: T[];
}

export interface DashboardStats {
  totalTitles: number;
  totalItems: number;
  totalPatrons: number;
  totalStaff: number;
  activeCheckouts: number;
  overdueCount: number;
  monthlyCheckouts: number;
}

export interface SystemConfig {
  key: string;
  value: string;
  description: string;
}
