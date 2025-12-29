import { getApi } from './client';

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    rating: number;
    isVip: boolean;
  };
  value: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  reward: number;
}

export interface UserAchievement {
  achievement: Achievement;
  unlockedAt: string;
}

export async function getLeaderboard(
  type: 'rating' | 'wins' | 'streak' = 'rating',
  limit = 100
): Promise<LeaderboardEntry[]> {
  return getApi<LeaderboardEntry[]>(`/api/leaderboard?type=${type}&limit=${limit}`);
}

export async function getAchievements(): Promise<Achievement[]> {
  return getApi<Achievement[]>('/api/achievements');
}

export async function getUserAchievements(): Promise<UserAchievement[]> {
  return getApi<UserAchievement[]>('/api/users/me/achievements');
}
