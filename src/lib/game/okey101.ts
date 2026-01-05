// ============================================
// 101 OKEY GAME LOGIC
// Complete implementation of 101 Okey rules
// ============================================

import {
  GameState,
  GamePlayer,
  GameSettings,
  Tile,
  Meld,
  TileColor,
  TileNumber,
  OpeningType,
  TurnPhase101,
  Score101,
  OKEY101_CONSTANTS,
} from './types';
import { createTileSet, shuffleTiles, sortTiles } from './tiles';

// ============================================
// GAME INITIALIZATION
// ============================================

/**
 * Create a new 101 Okey game
 */
export function create101Game(
  settings: GameSettings,
  creator: { id: string; name: string }
): GameState {
  const gameId = generateId();

  return {
    id: gameId,
    mode: 'okey101',
    status: 'waiting',
    players: [
      {
        id: creator.id,
        odayId: creator.id,
        name: creator.name,
        position: 0,
        tiles: [],
        isAI: false,
        isConnected: true,
        isReady: false,
        score101: 0,
        hasOpened: false,
        openingType: null,
        isEliminated: false,
      },
    ],
    tileBag: [],
    discardPile: [],
    indicatorTile: null,
    okeyTile: null,
    currentTurn: 0,
    turnPhase: 'draw',
    turnPhase101: 'draw',
    turnStartedAt: 0,
    turnTimeLimit: settings.turnTimeLimit || 60, // 101 needs more time
    roundNumber: 1,
    dealerIndex: 0,
    winnerId: null,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    tableMelds: [],
    pairsPlayerCount: 0,
    tilesPlayedThisTurn: [],
  };
}

/**
 * Start the 101 Okey game
 */
export function start101Game(game: GameState): GameState {
  if (game.players.length < 2) {
    throw new Error('En az 2 oyuncu gerekli');
  }

  // Create and shuffle tiles
  let tiles = createTileSet();
  tiles = shuffleTiles(tiles);

  // Determine indicator and okey
  // Pick a random non-joker tile as indicator
  const nonJokers = tiles.filter(t => !t.isJoker);
  const indicatorIndex = Math.floor(Math.random() * nonJokers.length);
  const indicatorTile = nonJokers[indicatorIndex];

  // Remove indicator from tiles
  tiles = tiles.filter(t => t.id !== indicatorTile.id);

  // Okey is same color, number + 1 (wraps from 13 to 1)
  const okeyNumber = indicatorTile.number === 13 ? 1 : (indicatorTile.number + 1) as TileNumber;
  const okeyTile: Tile = {
    id: 'okey_indicator',
    number: okeyNumber,
    color: indicatorTile.color,
    isJoker: false,
  };

  // Deal tiles: 21 each, 22 for dealer
  const dealerIndex = game.dealerIndex;
  const players = game.players.map((player, index) => {
    const tileCount = index === dealerIndex
      ? OKEY101_CONSTANTS.TILES_FOR_DEALER
      : OKEY101_CONSTANTS.TILES_PER_PLAYER;

    const playerTiles = tiles.splice(0, tileCount);

    return {
      ...player,
      tiles: sortTiles(playerTiles),
      hasOpened: false,
      openingType: null as OpeningType,
      roundScore: 0,
      lastDiscardedTile: null,
    };
  });

  // Dealer starts (in discard phase since they have 22 tiles)
  return {
    ...game,
    status: 'playing',
    players,
    tileBag: tiles,
    discardPile: [],
    indicatorTile,
    okeyTile,
    currentTurn: dealerIndex,
    turnPhase: 'discard', // Dealer must discard first
    turnPhase101: 'play',
    turnStartedAt: Date.now(),
    startedAt: Date.now(),
    tableMelds: [],
    pairsPlayerCount: 0,
    tilesPlayedThisTurn: [],
    drawnTileThisTurn: null,
  };
}

// ============================================
// TILE DRAWING
// ============================================

/**
 * Draw a tile from the pile (101 Okey version)
 */
export function draw101FromPile(game: GameState, playerId: string): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'draw') throw new Error('Şu an taş çekemezsiniz');
  if (game.tileBag.length === 0) throw new Error('Destede taş kalmadı');

  const drawnTile = game.tileBag[0];
  const newTileBag = game.tileBag.slice(1);
  const player = game.players[playerIndex];

  const updatedPlayers = game.players.map((p, i) =>
    i === playerIndex
      ? { ...p, tiles: [...p.tiles, drawnTile] }
      : p
  );

  return {
    ...game,
    players: updatedPlayers,
    tileBag: newTileBag,
    turnPhase: 'discard',
    turnPhase101: 'play',
    drawnTileThisTurn: drawnTile,
    tilesPlayedThisTurn: [],
  };
}

/**
 * Draw from discard pile (yandan alma) - 101 Okey rules
 * Must use this tile immediately in opening or adding to melds
 */
export function draw101FromDiscard(game: GameState, playerId: string): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'draw') throw new Error('Şu an taş çekemezsiniz');
  if (game.discardPile.length === 0) throw new Error('Atık yığınında taş yok');

  // Get tile from previous player's discard
  const prevPlayerIndex = (playerIndex - 1 + game.players.length) % game.players.length;
  const prevPlayer = game.players[prevPlayerIndex];

  if (!prevPlayer.lastDiscardedTile) {
    throw new Error('Alınacak taş yok');
  }

  const drawnTile = prevPlayer.lastDiscardedTile;
  const player = game.players[playerIndex];

  // Remove from discard pile
  const newDiscardPile = game.discardPile.slice(0, -1);

  const updatedPlayers = game.players.map((p, i) => {
    if (i === playerIndex) {
      return { ...p, tiles: [...p.tiles, drawnTile] };
    }
    if (i === prevPlayerIndex) {
      return { ...p, lastDiscardedTile: null };
    }
    return p;
  });

  return {
    ...game,
    players: updatedPlayers,
    discardPile: newDiscardPile,
    turnPhase: 'discard',
    turnPhase101: 'play',
    drawnTileThisTurn: drawnTile,
    tilesPlayedThisTurn: [],
  };
}

// ============================================
// OPENING HAND (YERE AÇMA)
// ============================================

/**
 * Calculate total points for a set of melds
 */
export function calculateMeldsPoints(melds: Meld[], okeyTile: Tile | null): number {
  let total = 0;

  for (const meld of melds) {
    for (const tile of meld.tiles) {
      if (tile.isJoker && okeyTile) {
        // Joker takes the value of the okey tile
        total += okeyTile.number;
      } else {
        total += tile.number;
      }
    }
  }

  return total;
}

/**
 * Validate if melds meet opening requirements
 */
export function validateOpening(
  melds: Meld[],
  openingType: 'series' | 'pairs',
  okeyTile: Tile | null
): { valid: boolean; points: number; error?: string } {
  if (openingType === 'pairs') {
    // Need 5+ pairs
    const pairCount = melds.filter(m => m.type === 'set' && m.tiles.length === 2).length;
    if (pairCount < OKEY101_CONSTANTS.MIN_PAIRS_TO_OPEN) {
      return { valid: false, points: 0, error: `En az ${OKEY101_CONSTANTS.MIN_PAIRS_TO_OPEN} çift gerekli` };
    }
    const points = calculateMeldsPoints(melds, okeyTile);
    return { valid: true, points };
  }

  // Series opening - need 101+ points
  const points = calculateMeldsPoints(melds, okeyTile);
  if (points < OKEY101_CONSTANTS.MIN_OPENING_POINTS) {
    return {
      valid: false,
      points,
      error: `En az ${OKEY101_CONSTANTS.MIN_OPENING_POINTS} puan gerekli (şu an: ${points})`,
    };
  }

  return { valid: true, points };
}

/**
 * Open hand by laying down melds
 */
export function openHand(
  game: GameState,
  playerId: string,
  melds: Meld[],
  openingType: 'series' | 'pairs'
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'play') throw new Error('Şu an açamazsınız');

  const player = game.players[playerIndex];
  if (player.hasOpened) throw new Error('Zaten açtınız');

  // Check pairs limit (max 3 players can go pairs)
  if (openingType === 'pairs') {
    if ((game.pairsPlayerCount || 0) >= 3) {
      throw new Error('En fazla 3 oyuncu çifte gidebilir');
    }
  }

  // Validate opening
  const validation = validateOpening(melds, openingType, game.okeyTile);
  if (!validation.valid) {
    throw new Error(validation.error || 'Geçersiz açılış');
  }

  // Validate all tiles in melds belong to player
  const meldTileIds = new Set<string>();
  for (const meld of melds) {
    for (const tile of meld.tiles) {
      if (meldTileIds.has(tile.id)) {
        throw new Error('Aynı taş birden fazla kullanılamaz');
      }
      meldTileIds.add(tile.id);

      if (!player.tiles.find(t => t.id === tile.id)) {
        throw new Error('Bu taşlar sizin elinizde değil');
      }
    }
  }

  // Validate each meld structure
  for (const meld of melds) {
    if (!validateMeldStructure(meld, game.okeyTile)) {
      throw new Error('Geçersiz grup yapısı');
    }
  }

  // If drew from discard, that tile must be used
  if (game.drawnTileThisTurn) {
    const drawnTileUsed = melds.some(m =>
      m.tiles.some(t => t.id === game.drawnTileThisTurn?.id)
    );
    if (!drawnTileUsed) {
      throw new Error('Yandan aldığınız taşı kullanmalısınız');
    }
  }

  // Remove tiles from player's hand
  const usedTileIds = new Set(melds.flatMap(m => m.tiles.map(t => t.id)));
  const remainingTiles = player.tiles.filter(t => !usedTileIds.has(t.id));

  // Assign IDs to melds and set ownership
  const newMelds: Meld[] = melds.map(m => ({
    ...m,
    id: generateId(),
    ownerId: playerId,
    isLocked: false,
  }));

  const updatedPlayers = game.players.map((p, i) =>
    i === playerIndex
      ? {
        ...p,
        tiles: remainingTiles,
        hasOpened: true,
        openingType,
      }
      : p
  );

  // Check if player finished (emptied hand)
  const finished = remainingTiles.length === 0;

  if (finished) {
    return finish101Game(
      {
        ...game,
        players: updatedPlayers,
        tableMelds: [...(game.tableMelds || []), ...newMelds],
        pairsPlayerCount: openingType === 'pairs'
          ? (game.pairsPlayerCount || 0) + 1
          : game.pairsPlayerCount,
        tilesPlayedThisTurn: [...(game.tilesPlayedThisTurn || []), ...melds.flatMap(m => m.tiles)],
      },
      playerId,
      openingType === 'pairs' ? 'cift' : 'normal'
    );
  }

  return {
    ...game,
    players: updatedPlayers,
    tableMelds: [...(game.tableMelds || []), ...newMelds],
    pairsPlayerCount: openingType === 'pairs'
      ? (game.pairsPlayerCount || 0) + 1
      : game.pairsPlayerCount,
    turnPhase101: 'play', // Can continue playing
    tilesPlayedThisTurn: [...(game.tilesPlayedThisTurn || []), ...melds.flatMap(m => m.tiles)],
  };
}

// ============================================
// LAYING MELDS AND ADDING TO MELDS
// ============================================

/**
 * Lay down a new meld (after opening)
 */
export function layMeld(
  game: GameState,
  playerId: string,
  meld: Meld
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'play') throw new Error('Şu an oynayamazsınız');

  const player = game.players[playerIndex];
  if (!player.hasOpened) throw new Error('Önce açmalısınız');

  // Validate meld structure
  if (!validateMeldStructure(meld, game.okeyTile)) {
    throw new Error('Geçersiz grup yapısı');
  }

  // Validate tiles belong to player
  for (const tile of meld.tiles) {
    if (!player.tiles.find(t => t.id === tile.id)) {
      throw new Error('Bu taşlar sizin elinizde değil');
    }
  }

  // Remove tiles from hand
  const usedTileIds = new Set(meld.tiles.map(t => t.id));
  const remainingTiles = player.tiles.filter(t => !usedTileIds.has(t.id));

  const newMeld: Meld = {
    ...meld,
    id: generateId(),
    ownerId: playerId,
    isLocked: false,
  };

  const updatedPlayers = game.players.map((p, i) =>
    i === playerIndex ? { ...p, tiles: remainingTiles } : p
  );

  // Check if finished
  if (remainingTiles.length === 0) {
    return finish101Game(
      {
        ...game,
        players: updatedPlayers,
        tableMelds: [...(game.tableMelds || []), newMeld],
      },
      playerId,
      'normal'
    );
  }

  return {
    ...game,
    players: updatedPlayers,
    tableMelds: [...(game.tableMelds || []), newMeld],
    tilesPlayedThisTurn: [...(game.tilesPlayedThisTurn || []), ...meld.tiles],
  };
}

/**
 * Add tile(s) to an existing meld
 */
export function addToMeld(
  game: GameState,
  playerId: string,
  meldId: string,
  tiles: Tile[],
  position: 'start' | 'end' | 'middle'
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'play') throw new Error('Şu an oynayamazsınız');

  const player = game.players[playerIndex];
  if (!player.hasOpened) throw new Error('Önce açmalısınız');

  // Find the meld
  const meldIndex = (game.tableMelds || []).findIndex(m => m.id === meldId);
  if (meldIndex === -1) throw new Error('Grup bulunamadı');

  const meld = game.tableMelds![meldIndex];

  // Validate tiles belong to player
  for (const tile of tiles) {
    if (!player.tiles.find(t => t.id === tile.id)) {
      throw new Error('Bu taşlar sizin elinizde değil');
    }
  }

  // Create new meld with added tiles
  let newTiles: Tile[];
  if (position === 'start') {
    newTiles = [...tiles, ...meld.tiles];
  } else if (position === 'end') {
    newTiles = [...meld.tiles, ...tiles];
  } else {
    // Middle - need to specify exact position
    throw new Error('Ortaya ekleme henüz desteklenmiyor');
  }

  const newMeld: Meld = { ...meld, tiles: newTiles };

  // Validate the new meld is still valid
  if (!validateMeldStructure(newMeld, game.okeyTile)) {
    throw new Error('Ekleme sonrası grup geçersiz');
  }

  // Remove tiles from hand
  const usedTileIds = new Set(tiles.map(t => t.id));
  const remainingTiles = player.tiles.filter(t => !usedTileIds.has(t.id));

  const updatedMelds = [...(game.tableMelds || [])];
  updatedMelds[meldIndex] = newMeld;

  const updatedPlayers = game.players.map((p, i) =>
    i === playerIndex ? { ...p, tiles: remainingTiles } : p
  );

  // Check if finished
  if (remainingTiles.length === 0) {
    return finish101Game(
      {
        ...game,
        players: updatedPlayers,
        tableMelds: updatedMelds,
      },
      playerId,
      'normal'
    );
  }

  return {
    ...game,
    players: updatedPlayers,
    tableMelds: updatedMelds,
    tilesPlayedThisTurn: [...(game.tilesPlayedThisTurn || []), ...tiles],
  };
}

// ============================================
// DISCARDING
// ============================================

/**
 * Discard a tile (101 Okey version)
 */
export function discard101(
  game: GameState,
  playerId: string,
  tileId: string
): GameState {
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) throw new Error('Oyuncu bulunamadı');
  if (playerIndex !== game.currentTurn) throw new Error('Sıra sizde değil');
  if (game.turnPhase101 !== 'play' && game.turnPhase101 !== 'mustDiscard') {
    throw new Error('Şu an atamazsınız');
  }

  const player = game.players[playerIndex];
  const tileIndex = player.tiles.findIndex(t => t.id === tileId);

  if (tileIndex === -1) throw new Error('Taş bulunamadı');

  const discardedTile = player.tiles[tileIndex];
  const newPlayerTiles = player.tiles.filter(t => t.id !== tileId);

  // Check penalty: if player hasn't opened and can add to existing melds
  // This is a complex rule - simplified for now
  if (!player.hasOpened && game.tableMelds && game.tableMelds.length > 0) {
    // Check if discarded tile could be added to any meld
    // If so, 101 penalty (we'll handle this in scoring)
  }

  // Move to next player
  const nextTurn = (game.currentTurn + 1) % game.players.length;

  // Skip eliminated players
  let actualNextTurn = nextTurn;
  let attempts = 0;
  while (game.players[actualNextTurn].isEliminated && attempts < game.players.length) {
    actualNextTurn = (actualNextTurn + 1) % game.players.length;
    attempts++;
  }

  const updatedPlayers = game.players.map((p, i) => {
    if (i === playerIndex) {
      return { ...p, tiles: newPlayerTiles, lastDiscardedTile: discardedTile };
    }
    return p;
  });

  // Lock all melds at end of turn
  const lockedMelds = (game.tableMelds || []).map(m => ({ ...m, isLocked: true }));

  // Check if tile bag is empty - end the round with no winner
  if (game.tileBag.length === 0) {
    return endRoundNoWinner({
      ...game,
      players: updatedPlayers,
      discardPile: [...game.discardPile, discardedTile],
      tableMelds: lockedMelds,
    });
  }

  return {
    ...game,
    players: updatedPlayers,
    discardPile: [...game.discardPile, discardedTile],
    tableMelds: lockedMelds,
    currentTurn: actualNextTurn,
    turnPhase: 'draw',
    turnPhase101: 'draw',
    turnStartedAt: Date.now(),
    drawnTileThisTurn: null,
    tilesPlayedThisTurn: [],
  };
}

// ============================================
// GAME FINISHING
// ============================================

/**
 * End round when tile bag is empty (no winner)
 * Everyone gets penalized for their remaining tiles
 */
export function endRoundNoWinner(game: GameState): GameState {
  // Calculate scores - no winner, everyone gets penalized
  const roundResults: Score101[] = game.players.map(player => {
    if (player.isEliminated) {
      return {
        playerId: player.id,
        playerName: player.name,
        tilesLeft: [],
        baseScore: 0,
        multiplier: 1,
        totalScore: 0,
        isWinner: false,
        isEliminated: true,
      };
    }

    // Calculate penalty based on remaining tiles
    let baseScore: number;

    if (!player.hasOpened) {
      // 202 penalty for not opening
      baseScore = OKEY101_CONSTANTS.UNOPENED_PENALTY;
    } else {
      // Sum of remaining tile values
      baseScore = calculateTileValues(player.tiles, game.okeyTile);
    }

    // Check if player has okey in hand (extra 101 penalty)
    const hasOkey = player.tiles.some(t =>
      !t.isJoker && game.okeyTile &&
      t.number === game.okeyTile.number &&
      t.color === game.okeyTile.color
    );

    if (hasOkey) {
      baseScore += OKEY101_CONSTANTS.STANDARD_PENALTY;
    }

    const totalScore = baseScore;
    const newTotal = (player.score101 || 0) + totalScore;

    return {
      playerId: player.id,
      playerName: player.name,
      tilesLeft: player.tiles,
      baseScore,
      multiplier: 1,
      totalScore,
      isWinner: false,
      isEliminated: newTotal >= 101,
    };
  });

  // Update player scores
  const updatedPlayers = game.players.map(player => {
    if (player.isEliminated) return player;

    const result = roundResults.find(r => r.playerId === player.id)!;
    const newScore = (player.score101 || 0) + result.totalScore;

    return {
      ...player,
      score101: newScore,
      roundScore: result.totalScore,
      isEliminated: newScore >= 101,
    };
  });

  // Check if game is over (only 1 player left)
  const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);

  if (remainingPlayers.length <= 1) {
    // Game over
    return {
      ...game,
      status: 'finished',
      players: updatedPlayers,
      winnerId: remainingPlayers[0]?.id || null,
      finishType: 'draw', // No winner - tile bag empty
      finishedAt: Date.now(),
      roundResults,
    };
  }

  // Round over, but game continues
  return {
    ...game,
    status: 'finished', // Round finished
    players: updatedPlayers,
    winnerId: null, // No winner this round
    finishType: 'draw', // Tile bag empty
    roundResults,
  };
}

/**
 * Finish the 101 Okey round
 */
export function finish101Game(
  game: GameState,
  winnerId: string,
  finishType: 'normal' | 'cift' | 'el'
): GameState {
  const winner = game.players.find(p => p.id === winnerId);
  if (!winner) throw new Error('Kazanan bulunamadı');

  // Check if winner has okey in hand (shouldn't happen if they finished properly)
  const winnerHasOkey = winner.tiles.some(t =>
    !t.isJoker && game.okeyTile &&
    t.number === game.okeyTile.number &&
    t.color === game.okeyTile.color
  );

  const multiplier = finishType === 'cift' ? OKEY101_CONSTANTS.OKEY_FINISH_MULTIPLIER : 1;

  // Calculate scores
  const roundResults: Score101[] = game.players.map(player => {
    if (player.id === winnerId) {
      return {
        playerId: player.id,
        playerName: player.name,
        tilesLeft: [],
        baseScore: OKEY101_CONSTANTS.WINNER_BONUS,
        multiplier: 1,
        totalScore: OKEY101_CONSTANTS.WINNER_BONUS,
        isWinner: true,
        isEliminated: false,
      };
    }

    // Calculate penalty for this player
    let baseScore: number;

    if (!player.hasOpened) {
      // 202 penalty for not opening
      baseScore = OKEY101_CONSTANTS.UNOPENED_PENALTY;
    } else {
      // Sum of remaining tile values
      baseScore = calculateTileValues(player.tiles, game.okeyTile);
    }

    // Check if player has okey in hand (extra 101 penalty)
    const hasOkey = player.tiles.some(t =>
      !t.isJoker && game.okeyTile &&
      t.number === game.okeyTile.number &&
      t.color === game.okeyTile.color
    );

    if (hasOkey) {
      baseScore += OKEY101_CONSTANTS.STANDARD_PENALTY;
    }

    const totalScore = baseScore * multiplier;
    const newTotal = (player.score101 || 0) + totalScore;

    return {
      playerId: player.id,
      playerName: player.name,
      tilesLeft: player.tiles,
      baseScore,
      multiplier,
      totalScore,
      isWinner: false,
      isEliminated: newTotal >= 101,
    };
  });

  // Update player scores
  const updatedPlayers = game.players.map(player => {
    const result = roundResults.find(r => r.playerId === player.id)!;
    const newScore = (player.score101 || 0) + result.totalScore;

    return {
      ...player,
      score101: newScore,
      roundScore: result.totalScore,
      isEliminated: newScore >= 101,
    };
  });

  // Check if game is over (only 1 player left)
  const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);

  if (remainingPlayers.length <= 1) {
    // Game over
    return {
      ...game,
      status: 'finished',
      players: updatedPlayers,
      winnerId: remainingPlayers[0]?.id || winnerId,
      finishType,
      finishedAt: Date.now(),
      roundResults,
    };
  }

  // Round over, but game continues
  return {
    ...game,
    status: 'finished', // Round finished
    players: updatedPlayers,
    winnerId,
    finishType,
    roundResults,
  };
}

/**
 * Start next round of 101 Okey
 */
export function start101NextRound(game: GameState): GameState {
  // Filter out eliminated players
  const activePlayers = game.players.filter(p => !p.isEliminated);

  if (activePlayers.length <= 1) {
    throw new Error('Oyun bitti - yeterli oyuncu yok');
  }

  // Rotate dealer among active players
  const currentDealerPos = game.dealerIndex;
  let nextDealerPos = (currentDealerPos + 1) % game.players.length;

  // Skip eliminated players for dealer
  while (game.players[nextDealerPos].isEliminated) {
    nextDealerPos = (nextDealerPos + 1) % game.players.length;
  }

  // Create fresh game state for new round
  const newGame: GameState = {
    ...game,
    status: 'playing',
    roundNumber: game.roundNumber + 1,
    dealerIndex: nextDealerPos,
    winnerId: null,
    finishType: undefined,
    tableMelds: [],
    discardPile: [],
    roundResults: undefined,
    pairsPlayerCount: 0,
  };

  // Reset player states for new round
  const resetPlayers = newGame.players.map(p => ({
    ...p,
    tiles: [],
    hasOpened: false,
    openingType: null as OpeningType,
    roundScore: 0,
    lastDiscardedTile: null,
  }));

  return start101Game({ ...newGame, players: resetPlayers });
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate meld structure (is it a valid set or run?)
 */
export function validateMeldStructure(meld: Meld, okeyTile: Tile | null): boolean {
  const tiles = meld.tiles;

  if (tiles.length < 3) return false;
  if (meld.type === 'set' && tiles.length > 4) return false;

  if (meld.type === 'set') {
    return validateSet(tiles, okeyTile);
  } else {
    return validateRun(tiles, okeyTile);
  }
}

/**
 * Validate a set (per) - same number, different colors
 */
function validateSet(tiles: Tile[], okeyTile: Tile | null): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  // Get the number (non-joker tiles)
  const nonJokerTiles = tiles.filter(t => !t.isJoker);
  if (nonJokerTiles.length === 0) return false; // Can't have all jokers

  const number = nonJokerTiles[0].number;

  // Check all non-joker tiles have same number
  if (!nonJokerTiles.every(t => t.number === number)) return false;

  // Check all colors are different
  const colors = new Set<TileColor>();
  for (const tile of tiles) {
    if (!tile.isJoker) {
      if (colors.has(tile.color)) return false;
      colors.add(tile.color);
    }
  }

  return true;
}

/**
 * Validate a run (seri) - consecutive numbers, same color
 */
function validateRun(tiles: Tile[], okeyTile: Tile | null): boolean {
  if (tiles.length < 3) return false;

  // Get color from non-joker tiles
  const nonJokerTiles = tiles.filter(t => !t.isJoker);
  if (nonJokerTiles.length === 0) return false;

  const color = nonJokerTiles[0].color;

  // Check all non-joker tiles have same color
  if (!nonJokerTiles.every(t => t.color === color)) return false;

  // Build number sequence, replacing jokers appropriately
  const numbers: number[] = [];
  let jokerCount = 0;

  for (const tile of tiles) {
    if (tile.isJoker) {
      jokerCount++;
      numbers.push(-1); // Placeholder for joker
    } else {
      numbers.push(tile.number);
    }
  }

  // Sort non-joker numbers to find gaps
  const sortedNonJoker = numbers.filter(n => n > 0).sort((a, b) => a - b);

  if (sortedNonJoker.length === 0) return false;

  // Check for valid sequence with jokers filling gaps
  const minNum = sortedNonJoker[0];
  const maxNum = sortedNonJoker[sortedNonJoker.length - 1];
  const expectedLength = maxNum - minNum + 1;

  if (expectedLength > tiles.length) return false;

  // Check no duplicates
  const uniqueNumbers = new Set(sortedNonJoker);
  if (uniqueNumbers.size !== sortedNonJoker.length) return false;

  // Note: 13-1-2 is NOT valid in 101 Okey
  if (sortedNonJoker.includes(13) && sortedNonJoker.includes(1)) {
    return false;
  }

  return true;
}

/**
 * Calculate total tile values
 */
function calculateTileValues(tiles: Tile[], okeyTile: Tile | null): number {
  return tiles.reduce((sum, tile) => {
    if (tile.isJoker && okeyTile) {
      return sum + okeyTile.number;
    }
    return sum + tile.number;
  }, 0);
}

// ============================================
// AI LOGIC FOR 101 OKEY
// ============================================

/**
 * AI decision making for 101 Okey
 */
export function ai101Move(game: GameState): GameState {
  const currentPlayer = game.players[game.currentTurn];
  if (!currentPlayer.isAI) return game;

  // Simple AI logic
  if (game.turnPhase101 === 'draw') {
    // Always draw from pile for simplicity
    return draw101FromPile(game, currentPlayer.id);
  }

  if (game.turnPhase101 === 'play') {
    // Try to open if possible
    if (!currentPlayer.hasOpened) {
      const possibleMelds = findPossibleMelds(currentPlayer.tiles, game.okeyTile);
      const points = calculateMeldsPoints(possibleMelds, game.okeyTile);

      if (points >= OKEY101_CONSTANTS.MIN_OPENING_POINTS && possibleMelds.length > 0) {
        try {
          return openHand(game, currentPlayer.id, possibleMelds, 'series');
        } catch {
          // Can't open, just discard
        }
      }
    } else {
      // Already opened, try to add to melds or lay new ones
      // For simplicity, just discard
    }

    // Discard a tile (pick one that's hardest to use)
    const tileToDiscard = pickTileToDiscard(currentPlayer.tiles, game.okeyTile);
    return discard101(game, currentPlayer.id, tileToDiscard.id);
  }

  return game;
}

/**
 * Find possible melds from tiles
 */
function findPossibleMelds(tiles: Tile[], okeyTile: Tile | null): Meld[] {
  const melds: Meld[] = [];

  // Find sets (same number, different colors)
  const byNumber = new Map<number, Tile[]>();
  for (const tile of tiles) {
    if (!tile.isJoker) {
      const existing = byNumber.get(tile.number) || [];
      byNumber.set(tile.number, [...existing, tile]);
    }
  }

  for (const [num, numTiles] of byNumber) {
    // Get unique colors
    const uniqueByColor = new Map<TileColor, Tile>();
    for (const tile of numTiles) {
      if (!uniqueByColor.has(tile.color)) {
        uniqueByColor.set(tile.color, tile);
      }
    }

    if (uniqueByColor.size >= 3) {
      melds.push({
        id: '',
        type: 'set',
        tiles: Array.from(uniqueByColor.values()).slice(0, 4),
        ownerId: '',
        isLocked: false,
      });
    }
  }

  // Find runs (consecutive numbers, same color)
  const byColor = new Map<TileColor, Tile[]>();
  for (const tile of tiles) {
    if (!tile.isJoker) {
      const existing = byColor.get(tile.color) || [];
      byColor.set(tile.color, [...existing, tile]);
    }
  }

  for (const [color, colorTiles] of byColor) {
    const sorted = [...colorTiles].sort((a, b) => a.number - b.number);
    const unique = sorted.filter((t, i) =>
      i === 0 || t.number !== sorted[i - 1].number
    );

    // Find consecutive sequences
    for (let start = 0; start < unique.length - 2; start++) {
      const run: Tile[] = [unique[start]];
      for (let j = start + 1; j < unique.length; j++) {
        if (unique[j].number === run[run.length - 1].number + 1) {
          run.push(unique[j]);
        } else {
          break;
        }
      }
      if (run.length >= 3) {
        melds.push({
          id: '',
          type: 'run',
          tiles: run,
          ownerId: '',
          isLocked: false,
        });
      }
    }
  }

  return melds;
}

/**
 * Pick a tile to discard (AI helper)
 */
function pickTileToDiscard(tiles: Tile[], okeyTile: Tile | null): Tile {
  // Don't discard okey tiles
  const nonOkey = tiles.filter(t => {
    if (t.isJoker) return false;
    if (okeyTile && t.number === okeyTile.number && t.color === okeyTile.color) return false;
    return true;
  });

  if (nonOkey.length === 0) {
    return tiles[0]; // Forced to discard okey
  }

  // Prefer discarding tiles that don't form potential melds
  // Simple heuristic: discard highest value isolated tile
  return nonOkey.sort((a, b) => b.number - a.number)[0];
}

// ============================================
// UTILITY
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
