'use client';

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import * as api from '@/lib/api/friends';

export function useFriends() {
  return useApi(
    useCallback(() => api.getFriends(), []),
    [],
    { refetchInterval: 30000 }
  );
}

export function useFriendRequests() {
  return useApi(
    useCallback(() => api.getFriendRequests(), []),
    [],
    { refetchInterval: 30000 }
  );
}

export function useSendFriendRequest() {
  return useMutation(api.sendFriendRequest);
}

export function useAcceptFriendRequest() {
  return useMutation(api.acceptFriendRequest);
}

export function useRejectFriendRequest() {
  return useMutation(api.rejectFriendRequest);
}

export function useRemoveFriend() {
  return useMutation(api.removeFriend);
}

export function useInviteFriend() {
  return useMutation((args: { userId: string; gameId: string }) =>
    api.inviteFriend(args.userId, args.gameId)
  );
}
