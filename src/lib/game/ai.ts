// ============================================
// AI PLAYER LOGIC
// Realistic AI that plays like a human
// ============================================

import { GameState, Tile, TileColor, TileGroup } from './types';
import { isOkey, sortTiles, TILE_COLORS } from './tiles';
import { isValidSet, isValidRun, findPossibleSets, findPossibleRuns } from './validation';

interface AIDecision {
  action: 'draw_pile' | 'draw_discard' | 'discard' | 'finish';
  tileId?: string;
  thinkingTime: number; // Milliseconds to wait (simulate thinking)
}

/**
 * Get realistic thinking time based on difficulty
 */
function getThinkingTime(difficulty: 'easy' | 'medium' | 'hard'): number {
  const baseTime = {
    easy: 3000,    // 3 seconds base
    medium: 2000,  // 2 seconds base
    hard: 1500,    // 1.5 seconds base
  };

  // Add random variation (±50%)
  const base = baseTime[difficulty];
  const variation = base * 0.5;
  return base + (Math.random() * variation * 2 - variation);
}

/**
 * Analyze hand for potential groups
 */
interface HandAnalysis {
  completeSets: TileGroup[];
  completeRuns: TileGroup[];
  potentialSets: { tiles: Tile[]; needed: number }[];
  potentialRuns: { tiles: Tile[]; needed: number }[];
  uselessTiles: Tile[];
  okeyCount: number;
}

function analyzeHand(tiles: Tile[], okeyTile: Tile): HandAnalysis {
  const okeys: Tile[] = [];
  const regular: Tile[] = [];

  for (const tile of tiles) {
    if (isOkey(tile, okeyTile)) {
      okeys.push(tile);
    } else {
      regular.push(tile);
    }
  }

  const completeSets = findPossibleSets(tiles, okeyTile);
  const completeRuns = findPossibleRuns(tiles, okeyTile);

  // Find potential sets (2 tiles of same number, different colors)
  const potentialSets: { tiles: Tile[]; needed: number }[] = [];
  const byNumber: Map<number, Tile[]> = new Map();

  for (const tile of regular) {
    if (!byNumber.has(tile.number)) {
      byNumber.set(tile.number, []);
    }
    byNumber.get(tile.number)!.push(tile);
  }

  for (const [num, tilesWithNum] of byNumber) {
    const uniqueColors = new Set(tilesWithNum.map(t => t.color));
    if (uniqueColors.size === 2) {
      potentialSets.push({
        tiles: tilesWithNum.slice(0, 2),
        needed: 1,
      });
    }
  }

  // Find potential runs (2 consecutive tiles of same color)
  const potentialRuns: { tiles: Tile[]; needed: number }[] = [];
  const byColor: Map<TileColor, Tile[]> = new Map();

  for (const tile of regular) {
    if (!byColor.has(tile.color)) {
      byColor.set(tile.color, []);
    }
    byColor.get(tile.color)!.push(tile);
  }

  for (const [color, tilesOfColor] of byColor) {
    const sorted = [...tilesOfColor].sort((a, b) => a.number - b.number);

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1].number === sorted[i].number + 1) {
        potentialRuns.push({
          tiles: [sorted[i], sorted[i + 1]],
          needed: 1,
        });
      }
      // Check for gap of 1 (could be filled with okey)
      if (sorted[i + 1].number === sorted[i].number + 2) {
        potentialRuns.push({
          tiles: [sorted[i], sorted[i + 1]],
          needed: 1,
        });
      }
    }
  }

  // Find useless tiles (not part of any group or potential)
  const usefulTileIds = new Set<string>();

  for (const group of [...completeSets, ...completeRuns]) {
    for (const tile of group.tiles) {
      usefulTileIds.add(tile.id);
    }
  }

  for (const potential of [...potentialSets, ...potentialRuns]) {
    for (const tile of potential.tiles) {
      usefulTileIds.add(tile.id);
    }
  }

  const uselessTiles = regular.filter(t => !usefulTileIds.has(t.id));

  return {
    completeSets,
    completeRuns,
    potentialSets,
    potentialRuns,
    uselessTiles,
    okeyCount: okeys.length,
  };
}

/**
 * Evaluate tile value (higher = more useful to keep)
 */
function evaluateTileValue(
  tile: Tile,
  analysis: HandAnalysis,
  okeyTile: Tile
): number {
  let value = 0;

  // Okeys are very valuable
  if (isOkey(tile, okeyTile)) {
    return 100;
  }

  // Check if part of complete group
  for (const set of analysis.completeSets) {
    if (set.tiles.some(t => t.id === tile.id)) {
      value += 50;
    }
  }

  for (const run of analysis.completeRuns) {
    if (run.tiles.some(t => t.id === tile.id)) {
      value += 50;
    }
  }

  // Check if part of potential group
  for (const potential of analysis.potentialSets) {
    if (potential.tiles.some(t => t.id === tile.id)) {
      value += 20;
    }
  }

  for (const potential of analysis.potentialRuns) {
    if (potential.tiles.some(t => t.id === tile.id)) {
      value += 15;
    }
  }

  // Middle numbers are slightly more valuable (more combination potential)
  if (tile.number >= 5 && tile.number <= 9) {
    value += 5;
  }

  return value;
}

/**
 * Decide whether to draw from pile or discard
 */
function decideDrawSource(
  game: GameState,
  playerIndex: number,
  difficulty: 'easy' | 'medium' | 'hard'
): 'pile' | 'discard' {
  const player = game.players[playerIndex];
  const okeyTile = game.okeyTile!;

  // If no discard pile, must draw from pile
  if (game.discardPile.length === 0) {
    return 'pile';
  }

  const discardTop = game.discardPile[game.discardPile.length - 1];

  // Easy AI: mostly random, slight preference for useful tiles
  if (difficulty === 'easy') {
    return Math.random() > 0.7 ? 'discard' : 'pile';
  }

  // Analyze current hand
  const analysis = analyzeHand(player.tiles, okeyTile);

  // Check if discarded tile completes a group
  const handWithDiscard = [...player.tiles, discardTop];
  const newAnalysis = analyzeHand(handWithDiscard, okeyTile);

  // If taking from discard creates more complete groups, take it
  const currentComplete = analysis.completeSets.length + analysis.completeRuns.length;
  const newComplete = newAnalysis.completeSets.length + newAnalysis.completeRuns.length;

  if (newComplete > currentComplete) {
    return 'discard';
  }

  // If taking helps potential groups
  const currentPotential = analysis.potentialSets.length + analysis.potentialRuns.length;
  const newPotential = newAnalysis.potentialSets.length + newAnalysis.potentialRuns.length;

  if (newPotential > currentPotential && difficulty === 'hard') {
    return Math.random() > 0.3 ? 'discard' : 'pile';
  }

  // Default: draw from pile (don't reveal strategy)
  return 'pile';
}

/**
 * Decide which tile to discard
 */
function decideDiscard(
  game: GameState,
  playerIndex: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Tile {
  const player = game.players[playerIndex];
  const okeyTile = game.okeyTile!;
  const analysis = analyzeHand(player.tiles, okeyTile);

  // Easy AI: random from useless or all tiles
  if (difficulty === 'easy') {
    if (analysis.uselessTiles.length > 0 && Math.random() > 0.3) {
      return analysis.uselessTiles[Math.floor(Math.random() * analysis.uselessTiles.length)];
    }
    // Don't discard okeys
    const nonOkeys = player.tiles.filter(t => !isOkey(t, okeyTile));
    return nonOkeys[Math.floor(Math.random() * nonOkeys.length)];
  }

  // Medium/Hard: evaluate all tiles and discard lowest value
  const tileValues: { tile: Tile; value: number }[] = [];

  for (const tile of player.tiles) {
    const value = evaluateTileValue(tile, analysis, okeyTile);
    tileValues.push({ tile, value });
  }

  // Sort by value (ascending) and pick lowest
  tileValues.sort((a, b) => a.value - b.value);

  // Hard AI: Consider what opponents might need
  if (difficulty === 'hard') {
    // Avoid discarding tiles that were recently picked from discard
    // This is a simplified heuristic
    const recentDiscards = game.discardPile.slice(-3);
    for (const tv of tileValues) {
      const wasRecent = recentDiscards.some(d =>
        d.number === tv.tile.number && d.color === tv.tile.color
      );
      if (!wasRecent) {
        return tv.tile;
      }
    }
  }

  return tileValues[0].tile;
}

/**
 * Check if AI should declare win
 */
function shouldDeclareWin(
  game: GameState,
  playerIndex: number,
  discardTileId?: string
): boolean {
  const player = game.players[playerIndex];
  const okeyTile = game.okeyTile!;

  let tiles = player.tiles;
  if (discardTileId) {
    tiles = tiles.filter(t => t.id !== discardTileId);
  }

  // Check if we have exactly 14 tiles that form valid groups
  if (tiles.length !== 14) return false;

  // Try to validate
  const { isValid } = require('./validation').validateWinningHand(tiles, okeyTile);
  return isValid;
}

/**
 * Main AI decision function
 */
export function getAIDecision(
  game: GameState,
  playerIndex: number
): AIDecision {
  const player = game.players[playerIndex];
  const difficulty = player.aiDifficulty || 'medium';
  const thinkingTime = getThinkingTime(difficulty);

  // Draw phase
  if (game.turnPhase === 'draw') {
    const source = decideDrawSource(game, playerIndex, difficulty);
    return {
      action: source === 'pile' ? 'draw_pile' : 'draw_discard',
      thinkingTime,
    };
  }

  // Discard phase
  const tileToDiscard = decideDiscard(game, playerIndex, difficulty);

  // Check if we can win by discarding this tile
  if (shouldDeclareWin(game, playerIndex, tileToDiscard.id)) {
    return {
      action: 'finish',
      tileId: tileToDiscard.id,
      thinkingTime: thinkingTime + 500, // Extra time for dramatic effect
    };
  }

  return {
    action: 'discard',
    tileId: tileToDiscard.id,
    thinkingTime,
  };
}

/**
 * Get a natural-sounding AI chat message
 */
export function getAIChatMessage(
  situation: 'start' | 'win' | 'lose' | 'draw_good' | 'draw_bad' | 'timeout',
  lang: 'tr' | 'en' = 'tr'
): string | null {
  // Only send messages sometimes (30% chance)
  if (Math.random() > 0.3) return null;

  const messages = {
    tr: {
      start: ['Haydi bakalım', 'İyi şanslar', 'Başlayalım', 'Kolay gelsin'],
      win: ['Teşekkürler', 'İyi oyundu', 'Güzel maçtı'],
      lose: ['Tebrikler', 'İyi oynadın', 'Bir dahaki sefere'],
      draw_good: ['Güzel', 'Hmm...', 'İyi geldi'],
      draw_bad: ['Eyvah', 'Bu ne ya', 'Şansıma bak'],
      timeout: ['Bekle biraz', 'Düşünüyorum'],
    },
    en: {
      start: ["Let's go", 'Good luck', "Let's start", 'Have fun'],
      win: ['Thanks', 'Good game', 'Nice match'],
      lose: ['Congrats', 'Well played', 'Next time'],
      draw_good: ['Nice', 'Hmm...', 'Good draw'],
      draw_bad: ['Oh no', 'What is this', 'My luck'],
      timeout: ['Wait a bit', 'Thinking'],
    },
  };

  const options = messages[lang][situation];
  return options[Math.floor(Math.random() * options.length)];
}
