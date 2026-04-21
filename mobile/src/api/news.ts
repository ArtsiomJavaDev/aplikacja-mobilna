import { api } from './client';
import type { NewsItem } from '../types';

export async function fetchNews(): Promise<NewsItem[]> {
  const response = await api.get<NewsItem[]>('/api/news');
  return response.data;
}

export async function triggerNewsRefresh(): Promise<void> {
  await api.post('/api/news/refresh');
}
