import type { GameState, Tile } from '@/lib/game/types';

// Player info in a room
export interface RoomPlayer {
  id: string;
  name: string;
  socketId: string;
  isConnected: boolean;
  isReady: boolean;
}

// Chat message
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

// Room state
export interface RoomState {
  gameId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  messages: ChatMessage[];
}

// Socket events - Client to Server
export interface ClientToServerEvents {
  join_game: (data: { gameId: string; playerId: string; playerName: string }) => void;
  leave_game: (data: { gameId: string; playerId: string }) => void;
  player_ready: (data: { gameId: string; playerId: string; isReady: boolean }) => void;
  game_state_update: (data: { gameId: string; gameState: GameState }) => void;
  draw_tile: (data: { gameId: string; playerId: string; source: 'pile' | 'discard' }) => void;
  discard_tile: (data: { gameId: string; playerId: string; tile: Tile }) => void;
  declare_win: (data: { gameId: string; playerId: string; tiles: Tile[] }) => void;
  turn_changed: (data: { gameId: string; currentTurn: number; turnPhase: 'draw' | 'discard' }) => void;
  game_finished: (data: { gameId: string; winnerId: string; results: any }) => void;
  chat_message: (data: { gameId: string; playerId: string; playerName: string; message: string }) => void;
  send_reaction: (data: { gameId: string; playerId: string; reaction: string }) => void;
  ping: (callback: (data: { timestamp: number }) => void) => void;
  reconnect_attempt: (data: { gameId: string; playerId: string }) => void;
}

// Socket events - Server to Client
export interface ServerToClientEvents {
  player_joined: (data: { playerId: string; playerName: string; playerCount: number }) => void;
  player_left: (data: { playerId: string; playerCount: number }) => void;
  player_disconnected: (data: { playerId: string; playerName: string }) => void;
  player_reconnected: (data: { playerId: string; playerName: string }) => void;
  players_updated: (data: { players: RoomPlayer[] }) => void;
  player_ready_changed: (data: { playerId: string; isReady: boolean }) => void;
  all_players_ready: (data: { playerCount: number }) => void;
  room_state: (data: RoomState) => void;
  game_state_sync: (data: { gameState: GameState }) => void;
  tile_drawn: (data: { playerId: string; source: 'pile' | 'discard'; timestamp: number }) => void;
  tile_discarded: (data: { playerId: string; tile: Tile; timestamp: number }) => void;
  win_declared: (data: { playerId: string; tiles: Tile[]; timestamp: number }) => void;
  turn_update: (data: { currentTurn: number; turnPhase: 'draw' | 'discard'; timestamp: number }) => void;
  game_ended: (data: { winnerId: string; results: any; timestamp: number }) => void;
  chat_received: (data: ChatMessage) => void;
  reaction_received: (data: { playerId: string; reaction: string; timestamp: number }) => void;
  reconnect_success: (data: { gameState: GameState | null; players: RoomPlayer[] }) => void;
  reconnect_failed: (data: { reason: string }) => void;
}
