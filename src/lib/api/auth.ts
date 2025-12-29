import { postApi } from './client';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  locale?: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  chips: number;
  rating: number;
  vipUntil: string | null;
  locale: string;
  avatarId: string | null;
  tileThemeId: string | null;
  tableThemeId: string | null;
  createdAt: string;
}

export async function register(data: RegisterData): Promise<User> {
  return postApi<User>('/api/auth/register', data);
}
