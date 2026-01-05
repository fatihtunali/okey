'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, RoomPlayer, ChatMessage, RoomState } from './types';
import type { GameState, Tile } from '@/lib/game/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: TypedSocket | null;
  isConnected: boolean;
  latency: number;
  roomPlayers: RoomPlayer[];
  chatMessages: ChatMessage[];
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  // Game room methods
  joinGame: (gameId: string, playerId: string, playerName: string) => void;
  leaveGame: (gameId: string, playerId: string) => void;
  setReady: (gameId: string, playerId: string, isReady: boolean) => void;
  // Game action methods
  syncGameState: (gameId: string, gameState: GameState) => void;
  emitDrawTile: (gameId: string, playerId: string, source: 'pile' | 'discard') => void;
  emitDiscardTile: (gameId: string, playerId: string, tile: Tile) => void;
  emitDeclareWin: (gameId: string, playerId: string, tiles: Tile[]) => void;
  emitTurnChanged: (gameId: string, currentTurn: number, turnPhase: 'draw' | 'discard') => void;
  emitGameFinished: (gameId: string, winnerId: string, results: any) => void;
  // Chat methods
  sendMessage: (gameId: string, playerId: string, playerName: string, message: string) => void;
  sendReaction: (gameId: string, playerId: string, reaction: string) => void;
  // Event handlers
  onGameStateSync: (callback: (gameState: GameState) => void) => void;
  onTileDrawn: (callback: (data: { playerId: string; source: 'pile' | 'discard' }) => void) => void;
  onTileDiscarded: (callback: (data: { playerId: string; tile: Tile }) => void) => void;
  onWinDeclared: (callback: (data: { playerId: string; tiles: Tile[] }) => void) => void;
  onTurnUpdate: (callback: (data: { currentTurn: number; turnPhase: 'draw' | 'discard' }) => void) => void;
  onGameEnded: (callback: (data: { winnerId: string; results: any }) => void) => void;
  onPlayerJoined: (callback: (data: { playerId: string; playerName: string }) => void) => void;
  onPlayerLeft: (callback: (data: { playerId: string }) => void) => void;
  onPlayerDisconnected: (callback: (data: { playerId: string; playerName: string }) => void) => void;
  onPlayerReconnected: (callback: (data: { playerId: string; playerName: string }) => void) => void;
  onAllPlayersReady: (callback: (data: { playerCount: number }) => void) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const callbacksRef = useRef<{
    onGameStateSync?: (gameState: GameState) => void;
    onTileDrawn?: (data: { playerId: string; source: 'pile' | 'discard' }) => void;
    onTileDiscarded?: (data: { playerId: string; tile: Tile }) => void;
    onWinDeclared?: (data: { playerId: string; tiles: Tile[] }) => void;
    onTurnUpdate?: (data: { currentTurn: number; turnPhase: 'draw' | 'discard' }) => void;
    onGameEnded?: (data: { winnerId: string; results: any }) => void;
    onPlayerJoined?: (data: { playerId: string; playerName: string }) => void;
    onPlayerLeft?: (data: { playerId: string }) => void;
    onPlayerDisconnected?: (data: { playerId: string; playerName: string }) => void;
    onPlayerReconnected?: (data: { playerId: string; playerName: string }) => void;
    onAllPlayersReady?: (data: { playerCount: number }) => void;
  }>({});

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
                      process.env.NEXT_PUBLIC_APP_URL ||
                      (typeof window !== 'undefined' ? window.location.origin : '');

    const newSocket: TypedSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Room events
    newSocket.on('room_state', (data: RoomState) => {
      setRoomPlayers(data.players);
      setChatMessages(data.messages);
      if (data.gameState && callbacksRef.current.onGameStateSync) {
        callbacksRef.current.onGameStateSync(data.gameState);
      }
    });

    newSocket.on('players_updated', ({ players }) => {
      setRoomPlayers(players);
    });

    newSocket.on('player_joined', (data) => {
      callbacksRef.current.onPlayerJoined?.(data);
    });

    newSocket.on('player_left', (data) => {
      callbacksRef.current.onPlayerLeft?.(data);
    });

    newSocket.on('player_disconnected', (data) => {
      callbacksRef.current.onPlayerDisconnected?.(data);
    });

    newSocket.on('player_reconnected', (data) => {
      callbacksRef.current.onPlayerReconnected?.(data);
    });

    newSocket.on('all_players_ready', (data) => {
      callbacksRef.current.onAllPlayersReady?.(data);
    });

    // Game events
    newSocket.on('game_state_sync', ({ gameState }) => {
      callbacksRef.current.onGameStateSync?.(gameState);
    });

    newSocket.on('tile_drawn', (data) => {
      callbacksRef.current.onTileDrawn?.(data);
    });

    newSocket.on('tile_discarded', (data) => {
      callbacksRef.current.onTileDiscarded?.(data);
    });

    newSocket.on('win_declared', (data) => {
      callbacksRef.current.onWinDeclared?.(data);
    });

    newSocket.on('turn_update', (data) => {
      callbacksRef.current.onTurnUpdate?.(data);
    });

    newSocket.on('game_ended', (data) => {
      callbacksRef.current.onGameEnded?.(data);
    });

    // Chat events
    newSocket.on('chat_received', (message) => {
      setChatMessages((prev) => [...prev.slice(-99), message]);
    });

    setSocket(newSocket);

    // Ping for latency measurement
    const pingInterval = setInterval(() => {
      const start = Date.now();
      newSocket.emit('ping', (response) => {
        if (response) {
          setLatency(Date.now() - start);
        }
      });
    }, 5000);

    return () => {
      clearInterval(pingInterval);
    };
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setRoomPlayers([]);
      setChatMessages([]);
    }
  }, [socket]);

  // Game room methods
  const joinGame = useCallback((gameId: string, playerId: string, playerName: string) => {
    socket?.emit('join_game', { gameId, playerId, playerName });
  }, [socket]);

  const leaveGame = useCallback((gameId: string, playerId: string) => {
    socket?.emit('leave_game', { gameId, playerId });
    setRoomPlayers([]);
    setChatMessages([]);
  }, [socket]);

  const setReady = useCallback((gameId: string, playerId: string, isReady: boolean) => {
    socket?.emit('player_ready', { gameId, playerId, isReady });
  }, [socket]);

  // Game action methods
  const syncGameState = useCallback((gameId: string, gameState: GameState) => {
    socket?.emit('game_state_update', { gameId, gameState });
  }, [socket]);

  const emitDrawTile = useCallback((gameId: string, playerId: string, source: 'pile' | 'discard') => {
    socket?.emit('draw_tile', { gameId, playerId, source });
  }, [socket]);

  const emitDiscardTile = useCallback((gameId: string, playerId: string, tile: Tile) => {
    socket?.emit('discard_tile', { gameId, playerId, tile });
  }, [socket]);

  const emitDeclareWin = useCallback((gameId: string, playerId: string, tiles: Tile[]) => {
    socket?.emit('declare_win', { gameId, playerId, tiles });
  }, [socket]);

  const emitTurnChanged = useCallback((gameId: string, currentTurn: number, turnPhase: 'draw' | 'discard') => {
    socket?.emit('turn_changed', { gameId, currentTurn, turnPhase });
  }, [socket]);

  const emitGameFinished = useCallback((gameId: string, winnerId: string, results: any) => {
    socket?.emit('game_finished', { gameId, winnerId, results });
  }, [socket]);

  // Chat methods
  const sendMessage = useCallback((gameId: string, playerId: string, playerName: string, message: string) => {
    socket?.emit('chat_message', { gameId, playerId, playerName, message });
  }, [socket]);

  const sendReaction = useCallback((gameId: string, playerId: string, reaction: string) => {
    socket?.emit('send_reaction', { gameId, playerId, reaction });
  }, [socket]);

  // Event handler setters
  const onGameStateSync = useCallback((callback: (gameState: GameState) => void) => {
    callbacksRef.current.onGameStateSync = callback;
  }, []);

  const onTileDrawn = useCallback((callback: (data: { playerId: string; source: 'pile' | 'discard' }) => void) => {
    callbacksRef.current.onTileDrawn = callback;
  }, []);

  const onTileDiscarded = useCallback((callback: (data: { playerId: string; tile: Tile }) => void) => {
    callbacksRef.current.onTileDiscarded = callback;
  }, []);

  const onWinDeclared = useCallback((callback: (data: { playerId: string; tiles: Tile[] }) => void) => {
    callbacksRef.current.onWinDeclared = callback;
  }, []);

  const onTurnUpdate = useCallback((callback: (data: { currentTurn: number; turnPhase: 'draw' | 'discard' }) => void) => {
    callbacksRef.current.onTurnUpdate = callback;
  }, []);

  const onGameEnded = useCallback((callback: (data: { winnerId: string; results: any }) => void) => {
    callbacksRef.current.onGameEnded = callback;
  }, []);

  const onPlayerJoined = useCallback((callback: (data: { playerId: string; playerName: string }) => void) => {
    callbacksRef.current.onPlayerJoined = callback;
  }, []);

  const onPlayerLeft = useCallback((callback: (data: { playerId: string }) => void) => {
    callbacksRef.current.onPlayerLeft = callback;
  }, []);

  const onPlayerDisconnected = useCallback((callback: (data: { playerId: string; playerName: string }) => void) => {
    callbacksRef.current.onPlayerDisconnected = callback;
  }, []);

  const onPlayerReconnected = useCallback((callback: (data: { playerId: string; playerName: string }) => void) => {
    callbacksRef.current.onPlayerReconnected = callback;
  }, []);

  const onAllPlayersReady = useCallback((callback: (data: { playerCount: number }) => void) => {
    callbacksRef.current.onAllPlayersReady = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    latency,
    roomPlayers,
    chatMessages,
    connect,
    disconnect,
    joinGame,
    leaveGame,
    setReady,
    syncGameState,
    emitDrawTile,
    emitDiscardTile,
    emitDeclareWin,
    emitTurnChanged,
    emitGameFinished,
    sendMessage,
    sendReaction,
    onGameStateSync,
    onTileDrawn,
    onTileDiscarded,
    onWinDeclared,
    onTurnUpdate,
    onGameEnded,
    onPlayerJoined,
    onPlayerLeft,
    onPlayerDisconnected,
    onPlayerReconnected,
    onAllPlayersReady,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
