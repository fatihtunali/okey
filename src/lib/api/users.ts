import { getApi, patchApi } from './client';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
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

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winStreak: number;
  bestWinStreak: number;
  totalScore: number;
  rank: number | null;
}

export interface UserPublic {
  id: string;
  name: string | null;
  image: string | null;
  rating: number;
  isVip: boolean;
  stats: UserStats | null;
  memberSince: string;
}

export interface UpdateProfileData {
  name?: string;
  locale?: string;
  avatarId?: string;
  tileThemeId?: string;
  tableThemeId?: string;
}

export async function getCurrentUser(): Promise<User> {
  return getApi<User>('/api/users/me');
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  return patchApi<User>('/api/users/me', data);
}

export async function getUserStats(): Promise<UserStats> {
  return getApi<UserStats>('/api/users/me/stats');
}

export async function getUserProfile(userId: string): Promise<UserPublic> {
  return getApi<UserPublic>(`/api/users/${userId}`);
}
