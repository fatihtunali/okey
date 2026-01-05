// ============================================
// GAME STATE MANAGEMENT
// Core game logic for Regular Okey and 101 Okey
// ============================================

import {
  GameState,
  GamePlayer,
  GameSettings,
  GameMove,
  Tile,
  GameMode,
  AI_NAMES_TR,
  Round101Result,
  Score101,
} from './types';
import {
  createTileSet,
  shuffleTiles,
  dealTiles,
  determineOkey,
  sortTiles,
} from './tiles';
import {
  validateWinningHand,
  isCiftOpening,
  calculateTileScore,
} from './validation';

/**
 * Generate unique game ID
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a 6-character room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get a random Turkish name for AI player
 */
export function getRandomAIName(usedNames: string[] = []): string {
  const available = AI_NAMES_TR.filter(name => !usedNames.includes(name));
  if (available.length === 0) {
    return AI_NAMES_TR[Math.floor(Math.random() * AI_NAMES_TR.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Create a new game
 */
export function createGame(settings: GameSettings, hostPlayer?: Partial<GamePlayer>): GameState {
  const gameId = generateGameId();

  // Create host player
  const players: GamePlayer[] = [];
  if (hostPlayer) {
    players.push({
      id: hostPlayer.id || `player_${Date.now()}`,
      odayId: hostPlayer.odayId || null,
      name: hostPlayer.name || 'Oyuncu',
      avatar: hostPlayer.avatar,
      position: 0,
      tiles: [],
      isAI: false,
      isConnected: true,
      isReady: false,
    });
  }

  const game: GameState = {
    id: gameId,
    mode: settings.mode,
    status: 'waiting',
    players,
    tileBag: [],
    discardPile: [],
    indicatorTile: null,
    okeyTile: null,
    currentTurn: 0,
    turnPhase: 'draw',
    turnStartedAt: 0,
    turnTimeLimit: settings.turnTimeLimit || 30,
    roundNumber: 1,
    dealerIndex: 0,
    winnerId: null,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
  };

  return game;
}

/**
 * Add a player to the game
 */
export function addPlayer(
  game: GameState,
  player: Partial<GamePlayer>,
  isAI = false
): GameState {
  if (game.players.length >= 4) {
    throw new Error('Masa dolu');
  }

  if (game.status !== 'waiting') {
    throw new Error('Oyun başlamış');
  }

  const usedNames = game.players.map(p => p.name);
  const position = game.players.length;

  const newPlayer: GamePlayer = {
    id: player.id || `player_${Date.now()}_${position}`,
    odayId: isAI ? null : (player.odayId || null),
    name: isAI ? getRandomAIName(usedNames) : (player.name || `Oyuncu ${position + 1}`),
    avatar: player.avatar,
    position,
    tiles: [],
    isAI,
    aiDifficulty: isAI ? (player.aiDifficulty || 'medium') : undefined,
    isConnected: true,
    isReady: isAI, // AI is always ready
    score101: game.mode === 'okey101' ? 0 : undefined,
  };

  return {
    ...game,
    players: [...game.players, newPlayer],
  };
}

/**
 * Fill remaining slots with AI players
 */
export function fillWithAI(game: GameState, targetPlayerCount = 4): GameState {
  let updatedGame = { ...game };

  while (updatedGame.players.length < targetPlayerCount) {
    updatedGame = addPlayer(updatedGame, {}, true);
  }

  return updatedGame;
}

/**
 * Start the game
 */
export function startGame(game: GameState): GameState {
  if (game.players.length < 2) {
    throw new Error('En az 2 oyuncu gerekli');
  }

  if (game.status !== 'waiting') {
    throw new Error('Oyun zaten başlamış');
  }

  // Create and shuffle tiles
  const tiles = createTileSet();
  const shuffled = shuffleTiles(tiles);

  // Determine okey
  const { indicator, okey } = determineOkey(shuffled);

  // Remove indicator from deck (it's shown face up)
  const deckWithoutIndicator = shuffled.filter(t => t.id !== indicator.id);

  // Deal tiles
  const dealerIndex = game.dealerIndex;
  const { hands, remaining } = dealTiles(
    deckWithoutIndicator,
    game.players.length,
    dealerIndex
  );

  // Update players with their tiles
  const updatedPlayers = game.players.map((player, index) => ({
    ...player,
    tiles: sortTiles(hands[index]),
    isReady: true,
  }));

  return {
    ...game,
    status: 'playing',
    players: updatedPlayers,
    tileBag: remaining,
    discardPile: [],
    indicatorTile: indicator,
    okeyTile: okey,
    currentTurn: dealerIndex, // Dealer plays first (has 15 tiles, must discard)
    turnPhase: 'discard', // Dealer starts with discard
    turnStartedAt: Date.now(),
    startedAt: Date.now(),
  };
}

/**
 * Draw a tile from the pile
 */
export function drawFromPile(game: GameState, playerId: string): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error('Oyuncu bulunamadı');
  }

  if (playerIndex !== game.currentTurn) {
    throw new Error('Sıra sizde değil');
  }

  if (game.turnPhase !== 'draw') {
    throw new Error('Önce taş çekmelisiniz');
  }

  if (game.tileBag.length === 0) {
    throw new Error('Çekilecek taş kalmadı');
  }

  const [drawnTile, ...remainingBag] = game.tileBag;

  const updatedPlayers = game.players.map((player, index) => {
    if (index === playerIndex) {
      return {
        ...player,
        tiles: sortTiles([...player.tiles, drawnTile]),
      };
    }
    return player;
  });

  return {
    ...game,
    players: updatedPlayers,
    tileBag: remainingBag,
    turnPhase: 'discard',
  };
}

/**
 * Draw from discard pile (take the last discarded tile)
 */
export function drawFromDiscard(game: GameState, playerId: string): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error('Oyuncu bulunamadı');
  }

  if (playerIndex !== game.currentTurn) {
    throw new Error('Sıra sizde değil');
  }

  if (game.turnPhase !== 'draw') {
    throw new Error('Önce taş çekmelisiniz');
  }

  if (game.discardPile.length === 0) {
    throw new Error('Atılan taş yok');
  }

  // Take the top tile from discard pile
  const discardedTile = game.discardPile[game.discardPile.length - 1];
  const newDiscardPile = game.discardPile.slice(0, -1);

  const updatedPlayers = game.players.map((player, index) => {
    if (index === playerIndex) {
      return {
        ...player,
        tiles: sortTiles([...player.tiles, discardedTile]),
      };
    }
    return player;
  });

  return {
    ...game,
    players: updatedPlayers,
    discardPile: newDiscardPile,
    turnPhase: 'discard',
  };
}

/**
 * Discard a tile
 */
export function discardTile(
  game: GameState,
  playerId: string,
  tileId: string
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error('Oyuncu bulunamadı');
  }

  if (playerIndex !== game.currentTurn) {
    throw new Error('Sıra sizde değil');
  }

  if (game.turnPhase !== 'discard') {
    throw new Error('Önce taş çekmelisiniz');
  }

  const player = game.players[playerIndex];
  const tileIndex = player.tiles.findIndex(t => t.id === tileId);

  if (tileIndex === -1) {
    throw new Error('Taş bulunamadı');
  }

  const discardedTile = player.tiles[tileIndex];
  const newPlayerTiles = player.tiles.filter(t => t.id !== tileId);

  // Move to next player
  const nextTurn = (game.currentTurn + 1) % game.players.length;

  const updatedPlayers = game.players.map((p, index) => {
    if (index === playerIndex) {
      // Update current player: remove tile and set lastDiscardedTile
      return { ...p, tiles: newPlayerTiles, lastDiscardedTile: discardedTile };
    }
    return p;
  });

  return {
    ...game,
    players: updatedPlayers,
    discardPile: [...game.discardPile, discardedTile],
    currentTurn: nextTurn,
    turnPhase: 'draw',
    turnStartedAt: Date.now(),
  };
}

/**
 * Declare win (finish the game)
 */
export function declareWin(
  game: GameState,
  playerId: string,
  discardTileId?: string
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    throw new Error('Oyuncu bulunamadı');
  }

  if (playerIndex !== game.currentTurn) {
    throw new Error('Sıra sizde değil');
  }

  const player = game.players[playerIndex];

  // If discarding while declaring, find the tile
  let discardTile: Tile | undefined;
  let tilesForValidation = player.tiles;

  if (discardTileId) {
    discardTile = player.tiles.find(t => t.id === discardTileId);
    if (!discardTile) {
      throw new Error('Atılacak taş bulunamadı');
    }
    tilesForValidation = player.tiles.filter(t => t.id !== discardTileId);
  }

  // Validate winning hand
  const validation = validateWinningHand(tilesForValidation, game.okeyTile!);

  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Geçersiz el');
  }

  // Check for çift (101 Okey bonus)
  const isCift = isCiftOpening(tilesForValidation, game.okeyTile!);

  // Determine finish type
  let finishType: 'normal' | 'cift' | 'el' = 'normal';
  if (isCift) {
    finishType = 'cift';
  }
  // 'el' finish is when you win on first turn without drawing

  // Update game state
  let updatedGame: GameState = {
    ...game,
    status: 'finished',
    winnerId: playerId,
    finishType,
    finishedAt: Date.now(),
  };

  // Add discard to pile if specified
  if (discardTile) {
    updatedGame.discardPile = [...game.discardPile, discardTile];
  }

  // For 101 Okey, calculate scores
  if (game.mode === 'okey101') {
    updatedGame = calculate101Scores(updatedGame, playerId, finishType);
  }

  return updatedGame;
}

/**
 * Calculate scores for 101 Okey round
 */
function calculate101Scores(
  game: GameState,
  winnerId: string,
  finishType: 'normal' | 'cift' | 'el'
): GameState {
  const multiplier = finishType === 'cift' ? 2 : 1;

  const updatedPlayers = game.players.map(player => {
    if (player.id === winnerId) {
      // Winner gets 0 points this round
      return {
        ...player,
        roundScore: 0,
      };
    }

    // Calculate score from remaining tiles
    const baseScore = calculateTileScore(player.tiles, game.okeyTile!);
    const roundScore = baseScore * multiplier;

    return {
      ...player,
      roundScore,
      score101: (player.score101 || 0) + roundScore,
    };
  });

  return {
    ...game,
    players: updatedPlayers,
  };
}

/**
 * Start next round (101 Okey)
 */
export function startNextRound(game: GameState): GameState {
  if (game.mode !== 'okey101') {
    throw new Error('Sadece 101 Okey modunda geçerli');
  }

  // Check for eliminated players (101+ points)
  const eliminated = game.players.filter(p => (p.score101 || 0) >= 101);
  const remaining = game.players.filter(p => (p.score101 || 0) < 101);

  if (remaining.length <= 1) {
    // Game over - only one player left
    return {
      ...game,
      status: 'finished',
      winnerId: remaining[0]?.id || null,
    };
  }

  // Rotate dealer
  const nextDealer = (game.dealerIndex + 1) % remaining.length;

  // Reset for new round
  const tiles = createTileSet();
  const shuffled = shuffleTiles(tiles);
  const { indicator, okey } = determineOkey(shuffled);
  const deckWithoutIndicator = shuffled.filter(t => t.id !== indicator.id);
  const { hands, remaining: remainingTiles } = dealTiles(
    deckWithoutIndicator,
    remaining.length,
    nextDealer
  );

  const updatedPlayers = remaining.map((player, index) => ({
    ...player,
    tiles: sortTiles(hands[index]),
    roundScore: 0,
    position: index,
  }));

  return {
    ...game,
    status: 'playing',
    players: updatedPlayers,
    tileBag: remainingTiles,
    discardPile: [],
    indicatorTile: indicator,
    okeyTile: okey,
    currentTurn: nextDealer,
    turnPhase: 'discard',
    turnStartedAt: Date.now(),
    roundNumber: game.roundNumber + 1,
    dealerIndex: nextDealer,
    winnerId: null,
    finishType: undefined,
  };
}

/**
 * Handle turn timeout
 */
export function handleTimeout(game: GameState): GameState {
  const currentPlayer = game.players[game.currentTurn];

  if (game.turnPhase === 'draw') {
    // Auto-draw from pile
    return drawFromPile(game, currentPlayer.id);
  } else {
    // Auto-discard random tile
    const randomTile = currentPlayer.tiles[
      Math.floor(Math.random() * currentPlayer.tiles.length)
    ];
    return discardTile(game, currentPlayer.id, randomTile.id);
  }
}

/**
 * Get visible game state for a specific player
 * (hides other players' tiles)
 */
export function getPlayerView(game: GameState, playerId: string): GameState {
  return {
    ...game,
    players: game.players.map(player => ({
      ...player,
      tiles: player.id === playerId
        ? player.tiles
        : player.tiles.map(t => ({ ...t, isFaceDown: true })),
    })),
    tileBag: [], // Don't expose remaining tiles
  };
}
