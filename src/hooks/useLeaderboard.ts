'use client';

import { useCallback } from 'react';
import { useApi } from './useApi';
import * as api from '@/lib/api/leaderboard';

export function useLeaderboard(type: 'rating' | 'wins' | 'streak' = 'rating', limit = 100) {
  return useApi(
    useCallback(() => api.getLeaderboard(type, limit), [type, limit]),
    [type, limit]
  );
}

export function useAchievements() {
  return useApi(
    useCallback(() => api.getAchievements(), []),
    []
  );
}

export function useUserAchievements() {
  return useApi(
    useCallback(() => api.getUserAchievements(), []),
    []
  );
}
