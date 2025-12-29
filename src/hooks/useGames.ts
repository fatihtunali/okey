'use client';

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import * as api from '@/lib/api/games';

export function useGameList(status = 'WAITING') {
  return useApi(
    useCallback(() => api.getGames(status), [status]),
    [status],
    { refetchInterval: 5000 }
  );
}

export function useGame(gameId: string | null) {
  return useApi(
    useCallback(() => gameId ? api.getGame(gameId) : Promise.reject('No game ID'), [gameId]),
    [gameId],
    { enabled: !!gameId, refetchInterval: 2000 }
  );
}

export function useCreateGame() {
  return useMutation(api.createGame);
}

export function useJoinGame() {
  return useMutation(api.joinGame);
}

export function useLeaveGame() {
  return useMutation(api.leaveGame);
}

export function useSetReady() {
  return useMutation(api.setReady);
}

export function useJoinByCode() {
  return useMutation(api.joinByCode);
}

export function useDrawTile() {
  return useMutation((args: { gameId: string; source: 'pile' | 'discard' }) =>
    api.drawTile(args.gameId, args.source)
  );
}

export function useDiscardTile() {
  return useMutation((args: { gameId: string; tileId: string }) =>
    api.discardTile(args.gameId, args.tileId)
  );
}

export function useFinishGame() {
  return useMutation((args: { gameId: string; discardTileId: string }) =>
    api.finishGame(args.gameId, args.discardTileId)
  );
}

export function useValidateHand() {
  return useMutation((args: { gameId: string; discardTileId?: string }) =>
    api.validateHand(args.gameId, args.discardTileId)
  );
}
