// ============================================
// OKEY GAME TYPES
// Supports both Regular Okey and 101 Okey
// ============================================

// Tile colors (4 colors in Okey)
export type TileColor = 'red' | 'yellow' | 'blue' | 'black';

// Tile numbers (1-13)
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// A single tile
export interface Tile {
  id: string;           // Unique identifier
  number: TileNumber;   // 1-13
  color: TileColor;     // red, yellow, blue, black
  isJoker: boolean;     // False joker (sahte okey)
  isFaceDown?: boolean; // For display purposes
}

// Game modes
export type GameMode = 'regular' | 'okey101';

// Game status
export type GameStatus = 'waiting' | 'starting' | 'playing' | 'finished' | 'cancelled';

// Player in a game
export interface GamePlayer {
  id: string;
  odayId: string | null;  // null for AI
  name: string;
  avatar?: string;
  position: number;       // 0-3 (seating position)
  tiles: Tile[];          // Current hand
  isAI: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  isConnected: boolean;
  isReady: boolean;

  // 101 Okey specific
  score101?: number;      // Cumulative score in 101 mode
  roundScore?: number;    // Score this round
}

// Game state
export interface GameState {
  id: string;
  mode: GameMode;
  status: GameStatus;

  // Players (2-4)
  players: GamePlayer[];

  // Tiles
  tileBag: Tile[];        // Remaining tiles to draw
  discardPile: Tile[];    // Discarded tiles (only top visible)

  // Okey determination
  indicatorTile: Tile | null;  // Gösterge - shows what okey is
  okeyTile: Tile | null;       // The actual okey (indicator + 1)

  // Turn management
  currentTurn: number;         // Player index (0-3)
  turnPhase: 'draw' | 'discard';
  turnStartedAt: number;       // Timestamp
  turnTimeLimit: number;       // Seconds (default 30)

  // Round info (for 101 Okey)
  roundNumber: number;
  dealerIndex: number;

  // Game end
  winnerId: string | null;
  finishType?: 'normal' | 'cift' | 'el';  // 101 Okey finish types

  // Timestamps
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
}

// Move types
export type MoveType =
  | 'draw_pile'      // Draw from tile bag
  | 'draw_discard'   // Take from discard pile
  | 'discard'        // Discard a tile
  | 'finish'         // Declare win
  | 'timeout';       // Turn timed out

// A game move
export interface GameMove {
  id: string;
  playerId: string;
  type: MoveType;
  tile?: Tile;        // The tile involved
  timestamp: number;
}

// Group types for winning hand validation
export type GroupType = 'set' | 'run';

// A valid group (per or seri)
export interface TileGroup {
  type: GroupType;
  tiles: Tile[];
}

// Result of hand validation
export interface HandValidation {
  isValid: boolean;
  groups: TileGroup[];
  remainingTiles: Tile[];
  errorMessage?: string;
}

// 101 Okey scoring
export interface Score101 {
  playerId: string;
  playerName: string;
  tilesLeft: Tile[];
  baseScore: number;      // Sum of tile values
  multiplier: number;     // 2x for çift, etc.
  totalScore: number;
  isWinner: boolean;
  isEliminated: boolean;  // Reached 101
}

// Round result for 101 Okey
export interface Round101Result {
  roundNumber: number;
  winnerId: string;
  finishType: 'normal' | 'cift' | 'el';
  scores: Score101[];
  eliminatedPlayers: string[];
}

// Game settings
export interface GameSettings {
  mode: GameMode;
  maxPlayers: 2 | 3 | 4;
  turnTimeLimit: number;
  isPrivate: boolean;
  roomCode?: string;

  // 101 Okey specific
  targetScore?: number;   // Default 101
  allowCift?: boolean;    // Allow çift opening
}

// Chat message
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;     // System messages
}

// Quick chat options (predefined messages)
export const QUICK_CHAT_TR = [
  'İyi oyunlar!',
  'Kolay gelsin',
  'Geçtim',
  'Haydi bakalım',
  'Tebrikler',
  'İyi şanslar',
  'Biraz bekle',
  'Devam',
] as const;

export const QUICK_CHAT_EN = [
  'Good game!',
  'Good luck',
  'Pass',
  "Let's go",
  'Congratulations',
  'Best of luck',
  'Wait a moment',
  'Continue',
] as const;

// Turkish names for AI players (realistic, no "Bot" indication)
export const AI_NAMES_TR = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Ömer',
  'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Büşra',
  'Yusuf', 'Emre', 'Burak', 'Murat', 'Cem', 'Serkan', 'Oğuz', 'Kemal',
  'Selin', 'Deniz', 'Canan', 'Derya', 'Gül', 'Sibel', 'Pınar', 'Aslı',
] as const;

// Colors in Turkish
export const TILE_COLORS_TR: Record<TileColor, string> = {
  red: 'Kırmızı',
  yellow: 'Sarı',
  blue: 'Mavi',
  black: 'Siyah',
};

export const TILE_COLORS_EN: Record<TileColor, string> = {
  red: 'Red',
  yellow: 'Yellow',
  blue: 'Blue',
  black: 'Black',
};
