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

// ============================================
// 101 OKEY SPECIFIC TYPES
// ============================================

// A meld (group) on the table - can be a set (per) or run (seri)
export interface Meld {
  id: string;
  type: 'set' | 'run';  // set = same number different colors, run = consecutive same color
  tiles: Tile[];
  ownerId: string;      // Player who first laid this meld
  isLocked: boolean;    // Can't be modified after turn ends
}

// How a player opened their hand
export type OpeningType = 'series' | 'pairs' | null;

// 101 Okey turn phases (more complex than regular)
export type TurnPhase101 =
  | 'draw'              // Must draw a tile
  | 'play'              // Can open, add to melds, or discard
  | 'mustDiscard';      // Must discard to end turn

// 101 Okey specific constants
export const OKEY101_CONSTANTS = {
  TILES_PER_PLAYER: 21,
  TILES_FOR_DEALER: 22,
  MIN_OPENING_POINTS: 101,
  MIN_PAIRS_TO_OPEN: 5,
  UNOPENED_PENALTY: 202,
  STANDARD_PENALTY: 101,
  WINNER_BONUS: -101,
  OKEY_FINISH_MULTIPLIER: 2,
} as const;

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
  lastDiscardedTile?: Tile | null;  // Last tile this player discarded (visible until next discard)

  // 101 Okey specific
  score101?: number;        // Cumulative score in 101 mode
  roundScore?: number;      // Score this round
  hasOpened?: boolean;      // Has player opened their hand this round?
  openingType?: OpeningType; // How did they open? (series or pairs)
  isEliminated?: boolean;   // Has player been eliminated (101+ points)?
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
  finishType?: 'normal' | 'cift' | 'el' | 'draw';  // 101 Okey finish types (draw = tile bag empty)

  // Timestamps
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;

  // ============================================
  // 101 OKEY SPECIFIC STATE
  // ============================================
  tableMelds?: Meld[];              // All melds on the table
  turnPhase101?: TurnPhase101;      // More detailed turn phase for 101
  pairsPlayerCount?: number;        // How many players chose pairs opening (max 3)
  roundResults?: Score101[];        // Results of current/last round
  drawnTileThisTurn?: Tile | null;  // Tile drawn this turn (for yandan alma rule)
  tilesPlayedThisTurn?: Tile[];     // Tiles played to table this turn
}

// Move types
export type MoveType =
  | 'draw_pile'      // Draw from tile bag
  | 'draw_discard'   // Take from discard pile
  | 'discard'        // Discard a tile
  | 'finish'         // Declare win
  | 'timeout'        // Turn timed out
  // 101 Okey specific moves
  | 'open_hand'      // Open hand with melds (101+ points or 5+ pairs)
  | 'lay_meld'       // Lay down additional meld after opening
  | 'add_to_meld';   // Add tile(s) to existing meld

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
  winnerId: string | null;
  finishType: 'normal' | 'cift' | 'el' | 'draw';
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
