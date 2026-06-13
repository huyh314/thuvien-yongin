import apiClient from './client';
import type { Book, PaginatedResponse } from '@yongin/types';

export const bookKeys = {
  all: ['books'] as const,
  newest: (limit: number) => [...bookKeys.all, 'newest', limit] as const,
  search: (q: string, type?: string) => [...bookKeys.all, 'search', q, type] as const,
  detail: (id: number) => [...bookKeys.all, 'detail', id] as const,
};

export async function getNewestBooks(limit = 12): Promise<Book[]> {
  const { data } = await apiClient.get(`/opac/newest?limit=${limit}`);
  return data;
}

export async function searchBooks(q: string, type = 'all', page = 1, limit = 20): Promise<PaginatedResponse<Book>> {
  const { data } = await apiClient.get(`/opac/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}&limit=${limit}`);
  return data;
}

export async function getSuggestions(q: string): Promise<{ text: string; type: string }[]> {
  if (q.length < 2) return [];
  const { data } = await apiClient.get(`/opac/suggest?q=${encodeURIComponent(q)}`);
  return data.suggestions || [];
}

export async function getBookDetail(id: number): Promise<Book> {
  const { data } = await apiClient.get(`/opac/works/${id}`);
  return data;
}

export async function getFeatured(): Promise<{ topics: { name: string; slug: string }[]; popular: Book[] }> {
  const { data } = await apiClient.get('/opac/featured');
  return data;
}
