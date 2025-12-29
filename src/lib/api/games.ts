import { getApi, postApi } from './client';

export interface GamePlayer {
  id: string;
  position: number;
  name: string | null;
  avatar: string | null;
  isAI: boolean;
  isConnected: boolean;
  isReady: boolean;
  tileCount: number;
  tiles?: Tile[];
  rating?: number;
  isVip?: boolean;
}

export interface Tile {
  id: string;
  number: number;
  color: 'red' | 'yellow' | 'blue' | 'black';
  tileType?: 'normal' | 'fake_okey';
  isJoker: boolean;
}

export interface TileGroup {
  type: 'set' | 'run';
  tiles: Tile[];
}

export interface GameLobby {
  id: string;
  mode: string;
  maxPlayers: number;
  currentPlayers: number;
  host: {
    id: string;
    name: string | null;
    image: string | null;
    rating: number;
    isVip: boolean;
  } | null;
}

export interface Game {
  id: string;
  status: 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED' | 'CANCELLED';
  mode: string;
  maxPlayers: number;
  isPrivate: boolean;
  roomCode: string | null;
  players: GamePlayer[];
  currentTurn: number;
  turnPhase: 'draw' | 'discard';
  indicatorTile: Tile | null;
  okeyTile: Tile | null;
  discardPileTop: Tile | null;
  tileBagCount: number;
  turnTimeLimit: number;
  turnStartedAt: string | null;
  winnerId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface CreateGameData {
  mode?: 'regular' | 'okey101';
  maxPlayers?: number;
  isPrivate?: boolean;
  turnTimeLimit?: number;
  fillWithAI?: boolean;
  stake?: {
    entryFee?: number;
    potDistribution?: 'winner_takes_all' | 'proportional';
  };
}

export interface GameEvent {
  id: string;
  gameId: string;
  type: string;
  actorPlayerId: string;
  payload: unknown;
  createdAt: string;
}

export interface HandValidation {
  isValid: boolean;
  groups: TileGroup[] | null;
  remainingTiles: Tile[];
  errorMessage: string | null;
}

// Game listing
export async function getGames(status = 'WAITING', limit = 20): Promise<GameLobby[]> {
  return getApi<GameLobby[]>(`/api/games?status=${status}&limit=${limit}`);
}

// Game CRUD
export async function createGame(data: CreateGameData = {}): Promise<Game> {
  return postApi<Game>('/api/games', data);
}

export async function getGame(gameId: string): Promise<Game> {
  return getApi<Game>(`/api/games/${gameId}`);
}

// Game actions
export async function joinGame(gameId: string): Promise<{ success: boolean; position: number }> {
  return postApi(`/api/games/${gameId}/join`);
}

export async function leaveGame(gameId: string): Promise<{ success: boolean }> {
  return postApi(`/api/games/${gameId}/leave`);
}

export async function setReady(gameId: string): Promise<{ success: boolean; isReady: boolean; allReady: boolean }> {
  return postApi(`/api/games/${gameId}/ready`);
}

export async function joinByCode(roomCode: string): Promise<{ success: boolean; gameId: string }> {
  return postApi('/api/games/join-by-code', { roomCode });
}

// In-game actions
export async function drawTile(gameId: string, source: 'pile' | 'discard'): Promise<{ success: boolean; tile: Tile; tileBagCount: number }> {
  return postApi(`/api/games/${gameId}/draw`, { source });
}

export async function discardTile(gameId: string, tileId: string): Promise<{ success: boolean; discardedTile: Tile; nextTurn: number }> {
  return postApi(`/api/games/${gameId}/discard`, { tileId });
}

export async function finishGame(gameId: string, discardTileId: string): Promise<{ success: boolean; winner: string; scores: { playerId: string; score: number; isWinner: boolean }[] }> {
  return postApi(`/api/games/${gameId}/finish`, { discardTileId });
}

export async function validateHand(gameId: string, discardTileId?: string): Promise<HandValidation> {
  return postApi(`/api/games/${gameId}/validate-hand`, { discardTileId });
}

// Game events
export async function getGameEvents(gameId: string, after?: string): Promise<GameEvent[]> {
  const url = after ? `/api/games/${gameId}/events?after=${after}` : `/api/games/${gameId}/events`;
  return getApi<GameEvent[]>(url);
}

export async function getReplay(gameId: string): Promise<{ game: Game; initialState: unknown; events: GameEvent[] }> {
  return getApi(`/api/games/${gameId}/replay`);
}
