import apiClient from './client';
import type { User } from '@yongin/types';

export async function login(username: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const { data } = await apiClient.post('/auth/login', { username, password });
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
